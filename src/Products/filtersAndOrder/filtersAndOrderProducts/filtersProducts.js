const { EntityProducts } = require('../../../db');
const { Op } = require('sequelize');

const filtersProducts = async (req, res) => {
    const { name, price, year, orderBy, orderDirection, priceMin, priceMax } = req.query;
    // const { priceMin, priceMax } = req.query;
    const { page = 1, limit = 9} = req.query;
    const offset = (page - 1) * limit;   // Calcula el inicio del paginado.
    const where = {};
// console.log(where);
    try {
        // Construye las condiciones de filtrado basadas en los parámetros de consulta.
        if (name) {
            where.nameProduct = { [Op.iLike]: `%${name}%` };
        }
        if (price) {
            where.priceProduct = price;
        }
        if (year) {
            where.yearProduct = year;
        }
        if ( priceMin || priceMax ) {
            if( priceMin && priceMax ){
                where.priceProduct = {
                    [Op.and]: [
                        { [Op.gte]: priceMin },
                        { [Op.lte]: priceMax }
                    ]
                };
            }
            else if (priceMin) {
                where.priceProduct = {[ Op.gte ] : priceMin}; // Mayor o igual que priceMin
            }
            else if (priceMax) {
                where.priceProduct= {[ Op.lte ] : priceMax}; // Menor o igual que priceMax
            }
        }


        const order = [];
        if (orderBy && orderDirection) {
            let selectedOrderBy = '';
            let selectedOrderDirection = '';

            if  (orderBy === 'priceProduct' || orderBy === 'yearProduct' || orderBy === 'nameProduct') {
                selectedOrderBy = orderBy;
            }
            {
                selectedOrderBy = orderBy;
            }

            if (orderDirection === 'ASC' || orderDirection === 'DESC') {
                selectedOrderDirection = orderDirection;
            }

            if (selectedOrderBy && selectedOrderDirection) {
                order.push([selectedOrderBy, selectedOrderDirection.toUpperCase()]);
            }
        }
        const resultFilters = await EntityProducts.findAndCountAll({
            where: { ...where },
            limit,
            offset,
            order: order.length > 0 ? order : undefined,
        });
        // console.log(order);

        if (resultFilters.rows.length < 1) {
            return res.status(400).send('No existen coincidencias.');
        }

        return res.status(200).json(resultFilters);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor.' });
    }
};

//EJEMPLO TE PETICION: http://localhost:3001/filterproducts?orderBy=nameProduct&orderDirection=ASC
//Por nombre: http://localhost:3001/filterproducts?name=iphone&orderBy=nameProduct&orderDirection=ASC

module.exports = {filtersProducts};
