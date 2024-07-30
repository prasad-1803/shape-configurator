const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Volume calculation functions
const calculateVolume = (shape, dimensions) => {
    const { width, height, radius } = dimensions;
    switch (shape) {
        case 'cube':
            return width ** 3;
        case 'cylinder':
            return Math.PI * radius ** 2 * height;
        case 'cone':
            return (Math.PI * radius ** 2 * height) / 3;
        case 'sphere':
            return (4 / 3) * Math.PI * radius ** 3;
        default:
            return 0;
    }
};


app.post('/api/calculate-volume', (req, res) => {
    const { shape, dimensions } = req.body;
    const volume = calculateVolume(shape, dimensions);
    res.json({ volume });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
