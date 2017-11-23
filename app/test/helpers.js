export function importModule(url) {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.type = 'module';
		script.src = url;

		script.onload = () => {
			resolve(script);
		};

		script.onerror = (q) => {
			console.log(q);
			reject(new Error(`Failed to load module script with URL ${url}`));
		};

		document.body.appendChild(script);
	});
}
