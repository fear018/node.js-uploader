const BASE_URL = "http://127.0.0.1:3000";

// drawing uploaded items
const drawUploadedItems = (items) => {
  const tbody = document.querySelector("#tbody");

  tbody.innerHTML = "";

  items.forEach((item, index) => {
    tbody.innerHTML += `
      <tr id=${item.id}>
        <td>${index + 1}</td>
        <td><img class="picture" src=${item.picture} alt="avatar" /></td>
        <td><input class="editInput" value='${item.name}' /></td>
        <td>
          <button class="editBtn">Edit</button>
          <button class="deleteBtn">Delete</button>
        </td>
      </tr>
    `;
  });
};

// base64
const getBase64Image = (image) => {
  let canvas = document.createElement("canvas");
  canvas.width = image.clientWidth;
  canvas.height = image.clientHeight;

  let context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, image.clientWidth, image.clientHeight);

  return canvas.toDataURL();
};

// requests
const uploadItem = async (item) => {
  try {
    const result = await (
      await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: JSON.stringify(item),
      })
    ).json();

    return result;
  } catch (error) {
    console.log("ERROR ==> uploadItem", error);
  }
};

const getItems = async () => {
  try {
    const result = await (await fetch(`${BASE_URL}/items`)).json();

    return result;
  } catch (error) {
    console.log("ERROR ==> getItems", error);
  }
};

const deleteItem = async (id) => {
  try {
    const result = await (
      await fetch(`${BASE_URL}/deleteItem?id=${id}`)
    ).json();

    return result;
  } catch (error) {
    console.log("ERROR ==> deleteItem", error);
  }
};

const updateItem = async (id, title) => {
  try {
    const result = await (
      await fetch(`${BASE_URL}/updateItem?id=${id}`, {
        method: "POST",
        body: JSON.stringify({ title }),
      })
    ).json();

    return result;
  } catch (error) {
    console.log("ERROR ==> deleteItem", error);
  }
};

// init application
const init = () => {
  const tbody = document.querySelector("#tbody");
  const uploadPicture = document.querySelector("#uploadPicture");
  const uploadButton = document.querySelector("#uploadButton");

  uploadPicture.addEventListener("change", (event) => {
    const imageWrapper = document.querySelector(".imageWrapper");
    const src = URL.createObjectURL(event.target.files[0]);

    imageWrapper.innerHTML = `<img src=${src} id="presentationPicture" />`;
  });

  uploadButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const name = document.querySelector("#uploadName").value;
    const presentationPicture = document.querySelector("#presentationPicture");
    const dataURL = getBase64Image(presentationPicture);
    const item = {
      name: name || uploadPicture?.files[0].name || "unnamed",
      picture: dataURL,
    };

    await uploadItem(item);

    const { data } = await getItems();

    drawUploadedItems(data);
  });

  tbody.addEventListener("click", async (event) => {
    if ([...event.target.classList].includes("deleteBtn")) {
      const id = event.target.closest("tr").id;

      await deleteItem(id);

      const { data } = await getItems();

      drawUploadedItems(data);
    }

    if ([...event.target.classList].includes("editBtn")) {
      const tr = event.target.closest("tr");
      const id = tr.id;
      const editedTitle = tr.querySelector("input").value;

      await updateItem(id, editedTitle);

      const { data } = await getItems();

      drawUploadedItems(data);
    }
  });
};

init();
