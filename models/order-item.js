const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
    // orderItems: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'OrderItem',
    //     required: true,
    // }],
});

// orderSchema.virtual('id').get(function() {
//     return this._id.toHexString();
// });

// orderSchema.set('toJSON', {
//     virtuals: true,
// });

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);