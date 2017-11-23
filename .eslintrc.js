module.exports = {
	"rules": {
		// 2 == error, 1 == warning, 0 == off
		"indent": [2, "tab", {
			"SwitchCase": 1,
			"VariableDeclarator": 2
		}],
		"max-len": [1, 120, {
			"ignoreComments": true,
			"ignoreUrls": true,
			"tabWidth": 2
		}],
		"no-empty": 2,
		"no-implicit-coercion": [2, {
			"boolean": false,
			"number": true,
			"string": true
		}],
		"no-unused-vars": 2,
		"quotes": [2, "single"],
		"strict": [2, "global"],
		"prefer-const": 2,
		"semi": 2
	},
	"parserOptions": {
		"ecmaVersion": 2017,
		"sourceType": "module"
	}
};