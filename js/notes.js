document.addEventListener("DOMContentLoaded", () => {
  /*
 notes: Array of objects
 {
      id: auto generated
      note-body: string
      is-done: true / false
 }
 */

  // check if the local storage has notes
  let notes = JSON.parse(localStorage.getItem("notes")) ?? [];
  let filteredNotes = notes;
  let searchQuery = "";
  let inputNote;

  applyChanges();

  const makeNoteModal = document.getElementById("makeNote");
  const btnApply = makeNoteModal.querySelector("#apply");
  const btnDeleteConfirm = document.querySelector("#btnDeleteConfirm");
  const confirmDeleteModal = document.getElementById("confirm");
  const notesForm = makeNoteModal.querySelector("#notesForm");
  const searchInput = document.querySelector("#searchNoteInput");
  const toastBody = document.querySelector(".toast-body");
  const toast = new bootstrap.Toast(document.getElementById("msg"));

  // action to do either add or the note id to edit
  let action;

  if (makeNoteModal) {
    makeNoteModal.addEventListener("show.bs.modal", (e) => {
      const modalTitle = makeNoteModal.querySelector(".modal-title");

      inputNote = makeNoteModal.querySelector("#note");
      action = e.relatedTarget.getAttribute("data-bs-action");

      let note = searchWithId(action);
      inputNote.value = note ? note.noteBody : "";

      checkInput();

      if (action === "add") {
        modalTitle.innerHTML = "ADD NOTE";
        inputNote.value = "";
      } else {
        modalTitle.innerHTML = "EDIT NOTE";
      }

      //  validate the input
      inputNote.addEventListener("input", () => checkInput());
    });
  }

  if (btnApply && notesForm) {
    notesForm.addEventListener("submit", (e) => {
      e.preventDefault();
      btnApply.click();
    });

    btnApply.addEventListener("click", () => {
      if (action === "add") {
        addNote(inputNote.value);
      } else {
        let noteBody = inputNote.value;
        let noteId = action;
        editNote(noteId, noteBody);
      }
    });
  }

  if (confirmDeleteModal) {
    confirmDeleteModal.addEventListener("show.bs.modal", (e) => {
      const noteId = e.relatedTarget.getAttribute("data-bs-delete");

      if (btnDeleteConfirm) {
        btnDeleteConfirm.addEventListener("click", function () {
          deleteNote(noteId);
        });
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = searchInput.value.toLowerCase(); // Get the search query
      filteredNotes = notes.filter((note) => {
        return note.noteBody.toLowerCase().includes(searchQuery); // Filter notes based on the query
      });

      applyChanges();
    });
  }

  // Add note
  function addNote(noteBody) {
    noteId = generateId();

    notes = [
      ...notes,
      {
        id: noteId,
        noteBody: noteBody.trim(),
        isDone: false,
      },
    ];

    saveInStorage("notes", notes);
    applyChanges();

    toastBody.innerHTML = "Data Added Successfully";
    toast.show();
  }

  function editNote(noteId, noteBody) {
    let index = searchForPosition(noteId);

    if (index !== -1) {
      notes[index].noteBody = noteBody;

      saveInStorage("notes", notes);
      applyChanges();

      toastBody.innerHTML = "Data Updated Successfully";
      toast.show();
    }
  }

  // search note with id
  function searchWithId(noteId) {
    return notes.find((ele) => ele.id === noteId);
  }

  // search for the position of the note in notes
  function searchForPosition(noteId) {
    return notes.findIndex((ele) => ele.id === noteId);
  }

  // delete note
  function deleteNote(noteId) {
    let index = searchForPosition(noteId);

    if (index !== -1) {
      notes.splice(index, 1);
      saveInStorage("notes", notes);
      applyChanges();

      toastBody.innerHTML = "Data Deleted Successfully";
      toast.show();
    }
  }

  // mark as done
  function toggelDone(noteId) {
    let index = searchForPosition(noteId);

    if (index !== -1) {
      notes[index].isDone = !notes[index].isDone;
      saveInStorage("notes", notes);
      applyChanges();
    }
  }

  // generate note id
  function generateId() {
    return "note-" + Date.now();
  }

  // save in storage
  function saveInStorage(key, item) {
    localStorage.setItem(key, JSON.stringify(item));
  }

  // update the content of html notes
  function renderHtmlNotes() {
    const notesParentNode = document.querySelector("#notes-wrapper");
    let notesHtml = "";
    //  there is no notes
    if (JSON.stringify(filteredNotes) === "[]") {
      notesHtml = `
      <img src="images/image.png" alt="No tasks picture">
      <p class="mt-2">Empty...</p>
    `;
    } else {
      filteredNotes.forEach((ele) => {
        notesHtml += `
      <div
        class="note d-flex align-items-center mb-3 pb-2"
        style="border-bottom: 1px solid var(--primary-color)"
      >
        <input
          type="checkbox"
          id="${ele.id}"
          class="form-check-input"
          aria-label="Check the note"
          style="width: 26px; height: 26px; border-radius: 2px"
          ${ele.isDone ? "checked" : ""}
        />

        <p class="${
          ele.isDone ? "text-secondary text-decoration-line-through" : ""
        } mb-0 fs-3 flex-grow-1 text-start ms-3">
          ${ele.noteBody}
        </p>

        <div class="btn-wrapper">
          <button
            type="button"
            class="btn border-0"
            aria-label="edit note"
            data-bs-toggle="modal" 
            data-bs-target="#makeNote" 
            data-bs-action="${ele.id}"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.67272 5.99106L2 12.6637V16H5.33636L12.0091 9.32736M8.67272 5.99106L11.0654 3.59837L11.0669 3.59695C11.3962 3.26759 11.5612 3.10261 11.7514 3.04082C11.9189 2.98639 12.0993 2.98639 12.2669 3.04082C12.4569 3.10257 12.6217 3.26735 12.9506 3.59625L14.4018 5.04738C14.7321 5.37769 14.8973 5.54292 14.9592 5.73337C15.0136 5.90088 15.0136 6.08133 14.9592 6.24885C14.8974 6.43916 14.7324 6.60414 14.4025 6.93398L14.4018 6.93468L12.0091 9.32736M8.67272 5.99106L12.0091 9.32736"
                stroke="#CDCDCD"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="btn border-0"
            aria-label="delete note"
            data-bs-toggle="modal" 
            data-bs-target="#confirm"
            data-bs-delete="${ele.id}"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z"
                stroke="#CDCDCD"
              />
              <path
                d="M14.625 3.75H3.375"
                stroke="#CDCDCD"
                stroke-linecap="round"
              />
              <path
                d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z"
                stroke="#CDCDCD"
              />
              <path
                d="M10.5 9V12.75"
                stroke="#CDCDCD"
                stroke-linecap="round"
              />
              <path
                d="M7.5 9V12.75"
                stroke="#CDCDCD"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      `;
      });
    }

    notesParentNode.innerHTML = notesHtml;
  }

  function checkInput() {
    if (inputNote.checkValidity() && inputNote.value.trim() !== "") {
      btnApply.disabled = false;
    } else {
      btnApply.disabled = true;
    }
  }

  function applyChanges() {
    notes = JSON.parse(localStorage.getItem("notes")) ?? [];
    filteredNotes = notes.filter((note) => {
      return note.noteBody.toLowerCase().includes(searchQuery);
    });

    renderHtmlNotes();
    attachCheckboxListeners();
  }

  function attachCheckboxListeners() {
    let checkboxes = document.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((box) => {
      box.addEventListener("click", (e) => {
        let noteId = e.target.id;
        toggelDone(noteId);
      });
    });
  }
});
