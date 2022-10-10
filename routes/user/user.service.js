const Invite = require('../invite/invite.model');
const User = require('./user.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//const updateUser = async (req, res) => {
//    const { username, array, dag } = req.body;
//	const usernameExists = await User.findOne({ username });
//    
//    if (usernameExists) {
//		switch (dag) {
//			case 0: // Maandag
//
//				User.updateOne(
//					{schema : {"eiwitten.1" : "4"}}
//				)
//
//				User.updateOne({ 
//					schema: {
//						eiwitten: array[0],
//						proteinen: array[1],
//						koolhydraten: array[2],
//						vet: array[3],
//					}
//				})
//				break;
//	
//		}
//    }
//}


const registerUser = async (req, res) => {
    const { username, password, invite } = req.body;


    if (!username || !password) {
		if (process.env.INVITE_ONLY && !invite){
			return res.status(200).json({
				success: false,
				message: 'Missing invite'
			});
		}
		else
		{
			return res.status(200).json({
				success: false,
				message: 'Missing required fields'
			});
		}
    }

    const usernameExists = await User.findOne({ username });
    
    if (usernameExists) {
        return res.status(200).json({
            success: false,
            message: 'Username already exists'
        });
    }

    if (password.length < 8) {
        return res.status(200).json({
            success: false,
            message: 'Password must be atleast 8 characters'
        });
    }

    if (username.length < 3) {
        return res.status(200).json({
            success: false,
            message: 'username must be atleast 3 characters'
        });
    }

    const DB_INVITE = await Invite.findOne({ code: invite });

    if (!DB_INVITE && process.env.INVITE_ONLY == "true") {
        return res.status(200).json({
            success: false,
            message: 'Invalid invite code'
        });
    }
	
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        password: hashedPassword,
    });

    await newUser.save();


	if (process.env.INVITE_ONLY == "true" || DB_INVITE) {
		await Invite.findByIdAndRemove(DB_INVITE._id);
	}
    

    return res.status(200).json({
        success: true,
        message: 'User created successfully',
    });
}

const loginUser = async (req, res) => {
    const { username, password } = req.body;

	
    if (!username || !password) {
        return res.status(200).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    const DB_USER = await User.findOne({ username });

	//{
	//	eetschema: {
	//	  eiwitten: [
	//		0, 0, 40, 0,
	//		4, 1,  4
	//	  ]
	//	}
	//}


	//DB_USER.updateOne({
	//	$set: {  
	//		'eetschema': [1,2,3]
	//	}
	//})
    // eetschema: { type: Object, required: true, default: {
	// 	eiwitten: [0,0,0,0,0,0,0],
	// 	proteinen: [0,0,0,0,0,0,0],
	// 	koolhydraten: [0,0,0,0,0,0,0],
	// 	vet: [0,0,0,0,0,0,0],
	// } },

	console.log('updating user')	
	if (!DB_USER) {
		return res.status(200).json({
			success: false,
			message: 'User not found'
		});
	}

	await bcrypt.compare(password, DB_USER.password, function(err, isMatch) {
		if (err) { throw err} 
		else if (!isMatch) {
			return res.status(200).json({
				success: false,
				message: 'Invalid password'
			});
		}
		else {
			const token = jwt.sign({
				username: DB_USER.username,
				_id: DB_USER._id,
			}, process.env.JWT_SECRET, { expiresIn: '7d' });
		
			res.cookie(process.env.JWT_NAME, token);
		
			if (!token) {
				return res.status(200).json({
					success: false,
					message: 'Failed to generate token'
				});
			}
		
			return res.status(200).json({
				success: true,
				message: 'User logged in successfully',
			});
		}
	})
}

module.exports = {
    registerUser,
    loginUser,
};