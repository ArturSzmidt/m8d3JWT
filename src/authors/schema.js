import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;
const AuthorSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: false },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=Unnamed+User',
    },
  },
  { timestamps: true }
);

AuthorSchema.pre('save', async function (next) {
  this.avatar = `https://ui-avatars.com/api/?name=${this.name}+${this.surname}`;
  const newUser = this;
  const plainPW = newUser.password;
  if (newUser.isModified('password')) {
    newUser.password = await bcrypt.hash(plainPW, 10);
  }

  next();
});

AuthorSchema.methods.toJSON = function () {
  const authorDocument = this;

  const authorObject = authorDocument.toObject();

  delete authorObject.password;
  delete authorObject.__v;

  return authorObject;
};

AuthorSchema.statics.checkCredentials = async function (email, plainPW) {
  // This function is going to receive email and pw

  // 1. Find the user by email

  const user = await this.findOne({ email }); // "this" represents the model

  if (user) {
    // 2. If the user is found we are going to compare plainPW with the hashed one
    const isMatch = await bcrypt.compare(plainPW, user.password);

    // 3. Return a meaningful response

    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

export default mongoose.model('Author', AuthorSchema);
