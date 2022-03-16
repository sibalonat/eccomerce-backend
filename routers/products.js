const express = require('express');
const { Category } = require('../models/category');
const { Product } = require('../models/product'); 
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        if (isValid) {
            uploadError = null
        }
        cb(uploadError, '/public/uploads')
    },
    filename: function(req, file, cb) {
        
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]; 
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({storage: storage});

router.get(`/`, async (req, res) => {
    // const productList = await Product.find().select('name image -_id');
    let filter = {};
    if (req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');

    // const productList = await Product.find();
    if (!productList) {
        return res.status(500).json({success: false})        
    }
    res.send(productList);
});

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        return res.status(500).json({success: false})        
    }
    res.send(product);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category) return res.status(400).send('Invalid Category');
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated
    });
    product = await product.save();
    if (!product) 
    return res.status(500).send('The product could not be added');

    res.send(product);

});

router.put(`/:id`, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('invalid product id')
    }
    
    const category = await Category.findById(req.params.id);
    if(!category) return res.status(400).send('no category loaded')
    const product = await Product .findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            dateCreated: req.body.dateCreated
        },
        {
            new:true
        }
    )
    if(!product)
    return res.status(500).send('product cannot be updated');

    res.send(product);
});

router.delete(`/:id`, (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({success: true, message: 'category deleted successfuly'})
        } else {
            res.status(404).json({success: false, message: 'could not find the category'})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err});
    });
});

// router.get('/get/count',  );

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);
    if (!productCount) {
        return res.status(500).json({success: false})        
    }
    res.send({
        productCount: productCount
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({isFeatured:true}).limit(+count);
    if (!products) {
        return res.status(500).json({success: false})        
    }
    res.send(products);
});

module.exports = router;