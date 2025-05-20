import { Blog } from "../model/blog.model.js";

const generateBlogId = async (data) => {
  const formattedTitle = data.title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  // Check if the packageId already exists in the collection
  const existing = await Blog.findOne({
    hId: formattedTitle,
  });

  if (!existing) {
    return formattedTitle;
  }

  return false;
};

export default generateBlogId;
