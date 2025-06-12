//Fetch all images used in post
const getUsedImageUrls = (html: string): Set<string> => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const imgs = doc.querySelectorAll("img");
  const used = new Set<string>();
  imgs.forEach((img) => {
    if (img.src) used.add(img.src);
  });
  return used;
};

//Delete any previously uploaded images that are no longer used in the post
const deleteUnusedImages = async (
  uploadedImages: Set<string>,
  usedUrls: Set<string>,
  token: string,
  apiBaseUrl: string
) => {
  for (const url of uploadedImages) {
    if (!usedUrls.has(url)) {
      const res = await fetch(`${apiBaseUrl}/api/image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (!res.ok) {
        console.warn("Failed to delete unused image:", url);
      }
    }
  }
};

export { getUsedImageUrls, deleteUnusedImages };
