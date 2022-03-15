const express = require('express');
const {User} = require('../models/user'); 
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.get(`/`, async (req, res) => {
    // const userList = await User.find().select('name phone email');
    const userList = await User.find().select('-passwordHash');
    res.send(userList);
});

router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        res.status(500).json({message: 'The user with the given id cannot be found'})
    }
    res.status(200).send(user);
});

router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        appartment: req.body.appartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    }); 

    user = await user.save();

    if (!user) 
    return res.status(400).send('cant register the user')

    return res.send(user);

});

// jsonwebtoken

router.put(`/:id`, async (req, res) => {
    const userExists = await User.findById(req.params.id);
    let newPass;
    if (req.body.password) {
        newPass = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPass = userExists.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPass,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            appartment: req.body.appartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        {
            new:true
        }
    )
    if(!user)
    return res.status(400).send('user cannot be updated');

    res.send(user);
});

router.post('/login', async (req, res) => {
    // const user = await User.findOne({email: req.body.email, passwordHash: req.body.password})
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;

    if (!user) {
        return res.status(400).send('The user is not found')
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id
            },
            secret,
            {
                expiresIn: '1d'
            }
        );
        res.status(200).send({
            user: user.email,
            token: token
        });
    } else {
        res.status(400).send('the entered password is incorrect');
    }

    return res.status(200).send(user);

});

module.exports = router;