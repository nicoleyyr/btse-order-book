module.exports = {
	css: {
		loaderOptions: {
				sass: {
					additionalData: `
						@import "@/assets/scss/_variables.scss";
					`
				}
		}
	},
	"devServer":{
		"proxy": {
			"/api": {
			"target": 'https://api.btse.com/',
			"pathRewrite": { '^/api': '' },
			"changeOrigin": true,
			"secure": false
			}
		}
	},
	publicPath: process.env.NODE_ENV === 'production'
    ? '/btse-order-book/'
    : '/'
}
