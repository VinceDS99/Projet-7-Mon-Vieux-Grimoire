const mongo = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongo.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongo.model('User', userSchema);