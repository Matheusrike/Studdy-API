function generateEnrollment(id) {
	const BASE = 100000;
	const suffix = id.toString().padStart(2, '0').slice(-2);
	const prefixNumber = BASE + Math.floor(id / 100);
	const prefix = prefixNumber.toString().padStart(6, '0');
	return `${prefix}-${suffix}`;
}

export { generateEnrollment };
