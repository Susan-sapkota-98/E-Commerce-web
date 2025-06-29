import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        lowercase: true,
    }
}, { timestamps: true });

// auto-generate slug
categorySchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = slugify(this.name);
    }
    next();
});

export default mongoose.model('Category', categorySchema);
