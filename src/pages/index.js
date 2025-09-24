import "./index.css";

import {
  enableValidation,
  validationConfig,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "c8b032fe-f4e7-45c7-987e-94563c86771d",
    "Content-Type": "application/json",
  },
});

// --- Global user state ---
let currentUser = {
  name: "",
  about: "",
  avatar: "",
};

// --- Helper for button loading state ---
function renderLoading(isLoading, buttonElement, loadingText = "Saving...") {
  if (isLoading) {
    buttonElement.textContent = loadingText;
  } else {
    buttonElement.textContent = buttonElement.dataset.defaultText;
  }
}

api
  .getAppInfo()
  .then(([cards, userData]) => {
    // set user info and global state
    currentUser.name = userData.name;
    currentUser.about = userData.about;
    currentUser.avatar = userData.avatar;

    profileNameEl.textContent = currentUser.name;
    profileDescriptionEl.textContent = currentUser.about;
    document.querySelector(".profile__avatar").src = currentUser.avatar;

    // render cards
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

//Profile Elements
const editProfileBtn = document.querySelector(".profile__edit-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileSubmitBtn = editProfileForm.querySelector(".modal__save-btn");

// Delete modal
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteSubmitBtn = deleteForm.querySelector(".modal__save-btn");
const deleteCancelBtn = deleteModal.querySelector(".modal__cancel-btn"); // ✅ NEW
let cardToDelete = null;
let cardToDeleteId = null;

//avatar modal elements
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarForm.querySelector(".modal__save-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarForm.querySelector("#profile-avatar-input");

const newPostModal = document.querySelector("#new-post-modal");
const editNewPostForm = newPostModal.querySelector(".modal__form");
const cardSubmitBtn = newPostModal.querySelector(".modal__save-btn");

const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const cardNameInput = newPostModal.querySelector("#card-image-input");
const cardDescriptionInput = newPostModal.querySelector("#card-caption-input");

const newPostBtn = document.querySelector(".profile__new-post-btn");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

const cardsList = document.querySelector(".cards__list");

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }
  cardLikeBtnEl.addEventListener("click", () => {
    if (cardLikeBtnEl.classList.contains("card__like-btn_active")) {
      api
        .removeLike(data._id)
        .then(() => cardLikeBtnEl.classList.remove("card__like-btn_active"))
        .catch(console.error);
    } else {
      api
        .addLike(data._id)
        .then(() => cardLikeBtnEl.classList.add("card__like-btn_active"))
        .catch(console.error);
    }
  });

  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
  cardDeleteBtnEl.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });
  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
}

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  resetValidation(editProfileForm, validationConfig); // ✅ reset validation before opening
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

previewModalCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

newPostBtn.addEventListener("click", function () {
  resetValidation(editNewPostForm, validationConfig); // ✅ reset validation before opening
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

function handleEditProfileSubmit(event) {
  event.preventDefault();
  renderLoading(true, editProfileSubmitBtn);

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      currentUser.name = data.name;
      currentUser.about = data.about;

      profileNameEl.textContent = currentUser.name;
      profileDescriptionEl.textContent = currentUser.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, editProfileSubmitBtn);
    });
}

function handleAvatarSubmit(event) {
  event.preventDefault();
  renderLoading(true, avatarSubmitBtn);

  const newAvatarUrl = avatarInput.value.trim();
  if (!newAvatarUrl) return;

  api
    .editUserAvatar({ avatar: newAvatarUrl })
    .then((data) => {
      currentUser.avatar = data.avatar; // update global state
      document.querySelector(".profile__avatar").src = currentUser.avatar;
      avatarForm.reset();
      closeModal(avatarModal);
      disableButton(avatarSubmitBtn);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, avatarSubmitBtn);
    });
}

// ---- DELETE HANDLERS ----
function handleDeleteCard(cardElement, cardId) {
  cardToDelete = cardElement;
  cardToDeleteId = cardId;
  openModal(deleteModal);
}

deleteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  renderLoading(true, deleteSubmitBtn, "Deleting...");

  if (cardToDelete && cardToDeleteId) {
    api
      .deleteCard(cardToDeleteId)
      .then(() => {
        cardToDelete.remove();
        cardToDelete = null;
        cardToDeleteId = null;
        closeModal(deleteModal); // ✅ only close on success
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        renderLoading(false, deleteSubmitBtn, "Deleting...");
      });
  } else {
    closeModal(deleteModal);
  }
});

deleteCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

// ✅ NEW Cancel button handler
deleteCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});
// --------------------------

avatarForm.addEventListener("submit", handleAvatarSubmit);

function handleEditNewPostSubmit(event) {
  event.preventDefault();
  renderLoading(true, cardSubmitBtn);

  const inputValues = {
    name: cardDescriptionInput.value,
    link: cardNameInput.value,
  };

  api
    .addCard(inputValues)
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardsList.prepend(cardElement);
      event.target.reset();
      disableButton(cardSubmitBtn);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, cardSubmitBtn);
    });
}

function disableButton(buttonElement) {
  //validation.js
  buttonElement.disabled = true;
  buttonElement.classList.add("modal__save-btn_disabled");
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
editNewPostForm.addEventListener("submit", handleEditNewPostSubmit);

avatarModalBtn.addEventListener("click", () => {
  resetValidation(avatarForm, validationConfig);
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal.modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
});

enableValidation(validationConfig);
