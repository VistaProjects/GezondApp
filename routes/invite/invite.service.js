const Invite = require('./invite.model');
const User = require('../user/user.model');
const bcrypt = require('bcrypt');


const randomString = (length) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

const createInvite = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(200).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    const DB_USER = await User.findOne({ username });

	if (!DB_USER) {
		return res.status(200).json({
			success: false,
			message: 'User not found'
		});
	}

	await bcrypt.compare(password, DB_USER.password, function(err, isMatch) {
		if (err) { throw err} 
		else if (!isMatch) {
			console.log('invalid pass')
			return res.status(200).json({
				success: false,
				message: 'Invalid password'
			});
		}
		else {
			// Check if the user has the high enough rank to create an invite
			if (DB_USER.group != 2) {
				return res.status(200).json({
					success: false,
					message: 'You do not have the permissions to create an invite'
				});
			}

			const generatedInvite = randomString(64);

			const invite = new Invite({
				code: generatedInvite,
			});

			invite.save();

			return res.status(200).json({
				success: true,
				message: 'Invite created',
				code: generatedInvite
			});
		}
	})
}

module.exports = {
    createInvite
};