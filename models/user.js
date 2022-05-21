import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;
import passportLocalMongoose from 'passport-local-mongoose';

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	phoneNumber: {
		type: Number,
		required: true
	},
	nickName: {
		type: String,
		required: true
	}
});
//ta passpor-local-mongoose nam na našo schemo doda username,
//salt, hash itd...
UserSchema.plugin(passportLocalMongoose);

export default model('User', UserSchema);
