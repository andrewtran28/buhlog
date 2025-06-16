const convertBase64ToS3 = async (
  html: string,
  token: string,
  apiBaseUrl: string,
  postId: number
): Promise<{ html: string; newImageUrls: Set<string> }> => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const imgs = doc.querySelectorAll("img");

  const newImageUrls = new Set<string>();

  for (const img of imgs) {
    const src = img.getAttribute("src");
    if (src && src.startsWith("data:image/")) {
      const blob = await (await fetch(src)).blob();
      const formData = new FormData();
      formData.append("image", blob, "embedded.png");
      formData.append("postId", postId.toString());

      try {
        const res = await fetch(`${apiBaseUrl}/api/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.imageUrl) {
          img.setAttribute("src", data.imageUrl);
          newImageUrls.add(data.imageUrl);
        }
      } catch (err) {
        console.error("Failed to upload embedded base64 image", err);
      }
    }
  }

  return { html: doc.body.innerHTML, newImageUrls };
};

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

// Delete unused images in a single API call
const deleteUnusedImages = async (html: string, postId: number, token: string, apiBaseUrl: string) => {
  try {
    const res = await fetch(`${apiBaseUrl}/api/image/unused`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, html }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.warn("Failed to delete unused images:", data.message || res.statusText);
    }
  } catch (err) {
    console.error("Error deleting unused images:", err);
  }
};

export { convertBase64ToS3, getUsedImageUrls, deleteUnusedImages };
