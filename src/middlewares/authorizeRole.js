export default function autorizeRole(role) {
	return (req, res, next) => {
		if (req.user.role !== role) {
			return res.status(403).json({
				message: `You don't have permission to access this route`,
			});
		}
		next();
	};
}
