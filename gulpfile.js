const path = require('path');
const { task, src, dest, series } = require('gulp');

task('build:icons', copyIcons);
task('copy:schema', copySchema);

function copyIcons() {
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
	const nodeDestination = path.resolve('dist', 'nodes');

	src(nodeSource, { encoding: false }).pipe(dest(nodeDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');

	return src(credSource).pipe(dest(credDestination));
}

function copySchema() {
	const schemaSource = path.resolve('netsuite', '*.json');
	const schemaDestination = path.resolve('dist', 'netsuite');
	return src(schemaSource).pipe(dest(schemaDestination));
}
