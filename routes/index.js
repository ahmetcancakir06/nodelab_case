const router = require("express").Router();
const fs = require('fs');
const path = require('path');

const routerDirectory = path.join(__dirname, './');

fs.readdirSync(routerDirectory).forEach(file => {
    if (file.endsWith('Routes.js')) {
        const route = require(path.join(routerDirectory, file));
        const routePrefix = file.replace('Routes.js', '').toLowerCase(); 
        router.use( route); 
    }
});

module.exports = router;