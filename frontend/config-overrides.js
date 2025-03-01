const path = require('path');

module.exports = function override(config, env) {
    // Add babel-loader for CKEditor
    config.module.rules.push({
        test: /ckeditor5-[^/\\]+[/\\].+\.js$/,
        loader: 'babel-loader',
        options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
        }
    });

    // Add CSS loader for CKEditor
    config.module.rules.push({
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [require('postcss-nested')]
                    }
                }
            }
        ]
    });

    // Add raw-loader for CKEditor SVG files
    config.module.rules.push({
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
        use: ['raw-loader']
    });

    // Increase memory limit for node
    config.performance = {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    };

    return config;
};