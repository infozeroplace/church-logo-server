// import httpStatus from "http-status";
// import ApiError from "../../error/ApiError.js";
import { gallerySearchableFields } from "../../constant/image.constant.js";
import { PaginationHelpers } from "../../helper/paginationHelper.js";
import cloudinary from "../../middleware/cloudinary.js";
import { Gallery } from "../../model/image.model.js";

const updateGalleryBrandingImages = async (payload) => {
  const { category, images = [] } = payload;

  // Fetch existing images in the specified category
  const existingImages = await Gallery.find({ category: category });

  // Collect IDs of documents to remove
  const documentsToRemove = [];
  for (const element of existingImages) {
    const isExists = images.find(
      (item) => item._id.toString() === element._id.toString()
    );

    if (!isExists) {
      for (const item of element.urls) {
        await cloudinary.v2.uploader.destroy(item.uid);
      }
      documentsToRemove.push(element._id);
    }
  }

  // Remove documents not present in the new images array
  const deleteResult = await Gallery.deleteMany({
    _id: { $in: documentsToRemove },
  });

  const bulkOperations = images.map((image, index) => ({
    updateOne: {
      filter: { "urls.uid": image.uid, category: category }, // Match by UID and category
      update: { $set: { serialId: index + 1, showBorder: image.showBorder } }, // Update serialId based on 1-based index
    },
  }));

  const result = await Gallery.bulkWrite(bulkOperations);

  return result;
};

const insertBrandingPhotos = async (payload) => {
  const { data, files } = payload;
  const { category } = data;

  const urls = [];

  for (const element of files) {
    const result = await cloudinary.v2.uploader.upload(element.path, {
      folder: `church-logo/gallery/${category}`,
      use_filename: true,
    });

    urls.push({ uid: result.public_id, url: result.secure_url });
  }

  const existingCount = await Gallery.countDocuments({ category });

  await Gallery.create({
    urls,
    category,
    serialId: existingCount + 1,
  });
};

const updateGalleryImages = async (payload) => {
  const { category, images = [] } = payload;

  // Fetch existing images in the specified category
  const existingImages = await Gallery.find({ category: category });

  // Collect IDs of documents to remove
  const documentsToRemove = [];
  for (const element of existingImages) {
    const isExists = images.find((item) => item.uid === element.urls[0].uid);
    if (!isExists) {
      await cloudinary.v2.uploader.destroy(element.urls[0].uid);
      documentsToRemove.push(element._id);
    }
  }

  // Remove documents not present in the new images array
  const deleteResult = await Gallery.deleteMany({
    _id: { $in: documentsToRemove },
  });

  const bulkOperations = images.map((image, index) => ({
    updateOne: {
      filter: { "urls.uid": image.uid, category: category }, // Match by UID and category
      update: { $set: { serialId: index + 1 } }, // Update serialId based on 1-based index
    },
  }));

  const result = await Gallery.bulkWrite(bulkOperations);

  return result;
};

const getGalleryImages = async (filters, paginationOptions) => {
  const { searchTerm, ...filtersData } = filters;

  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: gallerySearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andCondition.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions = andCondition.length > 0 ? { $and: andCondition } : {};

  const { page, limit, sortBy, sortOrder } =
    PaginationHelpers.calculationPagination(paginationOptions);

  const sortConditions = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const pipelines = [
    {
      $match: whereConditions, // Filtering conditions
    },
    {
      $sort: sortConditions, // Sorting stage
    },
  ];

  const result = await Gallery.aggregate(pipelines);

  return {
    meta: {
      page,
      limit,
      totalDocs: result.length,
    },
    data: result,
  };
};

const insertPhotos = async (payload) => {
  const { data, files } = payload;
  const { category } = data;

  const offset = 1000000; // Large offset to temporarily shift serialId

  // Step 1: Shift existing serialId values for the specific category
  await Gallery.updateMany(
    { category }, // Match documents in the same category
    { $inc: { serialId: offset } } // Temporarily shift serialId
  );

  // Step 2: Prepare new documents with serialId starting from 1 (after existing count)
  const existingCount = await Gallery.countDocuments({ category });
  const documentsToInsert = await Promise.all(
    files.map(async (img, index) => {
      const result = await cloudinary.v2.uploader.upload(img.path, {
        folder: `church-logo/gallery/${category}`,
        use_filename: true,
      });

      return {
        urls: [
          {
            uid: result.public_id,
            url: result.secure_url,
          },
        ],
        category,
        serialId: existingCount + index + 1, // New serialId continues after existing documents
      };
    })
  );

  // Step 3: Insert new documents
  await Gallery.insertMany(documentsToInsert);

  // Step 4: Reassign serialId for shifted documents within the same category
  const updatePromises = [];
  const shiftedDocuments = await Gallery.find({
    serialId: { $gte: offset },
    category,
  });

  for (const doc of shiftedDocuments) {
    updatePromises.push(
      Gallery.updateOne(
        { _id: doc._id },
        {
          $set: {
            serialId: doc.serialId - offset + existingCount + files.length,
          },
        } // Reassign correct serialId
      )
    );
  }

  await Promise.all(updatePromises);

  // Step 5: Return all documents in the category, sorted by serialId
  return await Gallery.find({ category }).sort({ serialId: 1 });
};

export const GalleryService = {
  updateGalleryBrandingImages,
  insertBrandingPhotos,
  updateGalleryImages,
  getGalleryImages,
  insertPhotos,
};
