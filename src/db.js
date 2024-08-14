require("dotenv").config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const DB_URL = process.env.DATABASE_URL || "postgres://default:E6dD4JaFqZgN@ep-hidden-mouse-a4he5slk.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require";

const sequelize = new Sequelize(DB_URL, {
    logging: false,
    native: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Solo si tu base de datos requiere SSL
        }
    }
});

const basename = path.basename(__filename);

const modelDefiners = [];

// Definición de modelos
require('./models/EntityProducts.js')(sequelize);
require('./models/EntityCategory.js')(sequelize);
require('./models/CharacteristicsProducts.js')(sequelize);
require('./models/EntityBrand.js')(sequelize);
require('./models/EntityUsers.js')(sequelize);
require('./models/entityPayment.js')(sequelize);
require('./models/entityShoppingSession.js')(sequelize);
require('./models/entityCartItem.js')(sequelize);
require('./models/entityOrderDetail.js')(sequelize);
require('./models/entityCartItem.js')(sequelize);
require('./models/entityUserAddress.js')(sequelize);
require('./models/EntityReview.js')(sequelize);
require('./models/EntityDiscount.js')(sequelize);
require('./models/EntityComments.js')(sequelize);
require('./models/EntityCoupon.js')(sequelize);
require('./models/EntityCouponUsage.js')(sequelize);
require('./models/EntityShipments.js')(sequelize);

fs.readdirSync(path.join(__dirname, '/models'))
    .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
    .forEach((file) => {
        modelDefiners.push(require(path.join(__dirname, '/models', file)));
    });

modelDefiners.forEach(model => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

const { 
    EntityProducts, 
    EntityCategory, 
    CharacteristicsProducts, 
    EntityBrand, 
    EntityUsers, 
    EntityOrderDetail, 
    EntityOrderItems, 
    EntityPayment, 
    EntityShoppingSession, 
    EntityCartItem, 
    EntityUserAddress, 
    EntityReview, 
    EntityDiscounts, 
    EntityShipments, 
    EntityComments, 
    CouponUsage, 
    Coupon } = sequelize.models;

// Relacion Products - Category
EntityProducts.belongsTo(EntityCategory, { foreignKey: 'idCategory' });
EntityCategory.hasMany(EntityProducts, { foreignKey: 'idCategory' });

EntityProducts.hasOne(CharacteristicsProducts, { foreignKey: 'idProduct' });
CharacteristicsProducts.belongsTo(EntityProducts, { foreignKey: 'idProduct' });

EntityBrand.hasMany(CharacteristicsProducts, { foreignKey: 'idBrand' });
CharacteristicsProducts.belongsTo(EntityBrand, { foreignKey: 'idBrand' });

EntityOrderDetail.hasMany(EntityOrderItems, { foreignKey: 'idOrderDetail', targetKey: 'idOrderDetail' });
EntityOrderItems.belongsTo(EntityOrderDetail, { foreignKey: 'idOrderDetail', sourceKey: 'idOrderDetail' });


EntityPayment.hasOne(EntityOrderDetail, { foreignKey: 'idPayment' });
EntityOrderDetail.belongsTo(EntityPayment, { foreignKey: 'idPayment' });

EntityUsers.hasOne(EntityOrderDetail, { foreignKey: 'idUser', as: 'orderDetail' });
EntityOrderDetail.belongsTo(EntityUsers, { foreignKey: 'idUser', as: 'user' });

EntityProducts.hasMany(EntityOrderItems, { foreignKey: 'idProduct' });
EntityOrderItems.belongsTo(EntityProducts, { foreignKey: 'idProduct' });

EntityUsers.hasOne(EntityShoppingSession, { foreignKey: 'idUser' });
EntityShoppingSession.belongsTo(EntityUsers, { foreignKey: 'idUser' });

EntityShoppingSession.hasMany(EntityCartItem, { foreignKey: 'idShoppingSession' });
EntityCartItem.belongsTo(EntityShoppingSession, { foreignKey: 'idShoppingSession' });

EntityProducts.belongsToMany(EntityCartItem, { through: 'ProductCartItem', foreignKey: 'idProduct' });
EntityCartItem.belongsToMany(EntityProducts, { through: 'ProductCartItem', foreignKey: 'idCartItem' });

EntityUsers.hasMany(EntityPayment, { foreignKey: 'idUser', sourceKey: 'idUser' });
EntityPayment.belongsTo(EntityUsers, { foreignKey: 'idUser', targetKey: 'idUser' });

EntityUsers.hasMany(EntityUserAddress, { foreignKey: 'idUser', sourceKey: 'idUser' });
EntityUserAddress.belongsTo(EntityUsers, { foreignKey: 'idUser', targetKey: 'idUser' });

// Relación user/Review - review-user 1:M
EntityUsers.hasMany(EntityReview, { foreignKey: 'idUser' });
EntityReview.belongsTo(EntityUsers, { foreignKey: 'idUser' });

// Relación Products/review - Review/products 1:M
EntityProducts.hasMany(EntityReview, { foreignKey: 'idProduct' });
EntityReview.belongsTo(EntityProducts, { foreignKey: 'idReview' });

// Relación Products/discounts - N:N
EntityProducts.belongsToMany(EntityDiscounts, { through: 'ProductsDiscounts' });
EntityDiscounts.belongsToMany(EntityProducts, { through: 'ProductsDiscounts' });

// Relación User/comments - Comments/User 1:M
EntityUsers.hasMany(EntityComments, { foreignKey: 'idUser' });
EntityComments.belongsTo(EntityUsers, { foreignKey: 'idUser' });

// Relación Product/Comments - comments/product 1:M
EntityProducts.hasMany(EntityComments, { foreignKey: 'idProduct' });
EntityComments.belongsTo(EntityProducts, { foreignKey: 'idComments' });

CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId' });
Coupon.hasMany(CouponUsage, { foreignKey: 'couponId' });

// Relación EntityOrderDetail/EntityShipments
EntityOrderDetail.belongsTo(EntityShipments, { foreignKey: 'idShipment' });
EntityShipments.hasMany(EntityOrderDetail, { foreignKey: 'idShipment' });

// Relación EntityOrderDetail/EntityUserAddress
// EntityOrderDetail.belongsTo(EntityUserAddress, { foreignKey: 'idUserAddress' });
// EntityUserAddress.hasMany(EntityOrderDetail, { foreignKey: 'idUserAddress' });

module.exports = {
    ...sequelize.models,
    conn: sequelize,
};
