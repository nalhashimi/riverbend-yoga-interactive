/* ==========================================================
   Riverbend Yoga Studio - interactivity
   1. Class Finder (services.html): filter classes by goal and
      save a preferred class to localStorage.
   2. Request form (events.html): JavaScript validation with
      error messages next to each field, plus pre-filling the
      saved class and contact details from localStorage.
   ========================================================== */

/* ---------- Data ---------- */

// Each class the studio offers. "tags" connect a class to the goals below.
const classes = [
  {
    id: "gentle-flow",
    name: "Gentle Flow",
    schedule: "Mon & Wed, 9:00 a.m. and 6:00 p.m.",
    length: "60 minutes",
    description: "Slow, steady movement with plenty of breathing cues. A great first class.",
    tags: ["beginner", "gentle", "stress"]
  },
  {
    id: "vinyasa",
    name: "Vinyasa",
    schedule: "Tue & Thu, 6:30 a.m. and 12:15 p.m.",
    length: "45 minutes",
    description: "A flowing class that builds strength and focus. The lunch-hour session fits a workday.",
    tags: ["busy", "strength"]
  },
  {
    id: "restorative",
    name: "Restorative Yoga",
    schedule: "Fri, 7:00 p.m.",
    length: "75 minutes",
    description: "Long, supported poses with bolsters and blankets to rest and recover.",
    tags: ["gentle", "stress"]
  },
  {
    id: "chair-yoga",
    name: "Chair Yoga",
    schedule: "Sat, 10:00 a.m.",
    length: "45 minutes",
    description: "Seated and standing poses with a chair for support. Comfortable for older adults.",
    tags: ["beginner", "gentle", "older"]
  }
];

// The goals a visitor can filter by.
const filters = [
  { id: "all", label: "All classes" },
  { id: "beginner", label: "New to yoga" },
  { id: "busy", label: "Short on time" },
  { id: "gentle", label: "Easy on the joints" },
  { id: "older", label: "Older adults" },
  { id: "stress", label: "Stress relief" },
  { id: "strength", label: "Build strength" }
];

// localStorage keys used across pages.
const STORAGE_KEYS = {
  preferredClass: "riverbend-preferred-class",
  contact: "riverbend-contact"
};

/* ---------- Storage helpers ---------- */

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage can be unavailable (for example, in private browsing).
    console.warn("Could not save to localStorage:", error);
  }
}

function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function findClassById(id) {
  return classes.find(function (yogaClass) {
    return yogaClass.id === id;
  });
}

/* ==========================================================
   1. Class Finder
   ========================================================== */

function renderFilterButtons(container, activeFilter) {
  container.innerHTML = "";
  filters.forEach(function (filter) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = filter.label;
    button.dataset.filter = filter.id;
    button.setAttribute("aria-pressed", String(filter.id === activeFilter));
    container.appendChild(button);
  });
}

function getMatchingClasses(filterId) {
  if (filterId === "all") {
    return classes;
  }
  return classes.filter(function (yogaClass) {
    return yogaClass.tags.includes(filterId);
  });
}

function createClassCard(yogaClass, savedId) {
  const card = document.createElement("article");
  card.className = "card finder-card";

  const isSaved = yogaClass.id === savedId;
  if (isSaved) {
    card.classList.add("is-saved");
  }

  const title = document.createElement("h3");
  title.textContent = yogaClass.name;

  const details = document.createElement("p");
  details.className = "class-meta";
  details.textContent = yogaClass.schedule + " · " + yogaClass.length;

  const description = document.createElement("p");
  description.textContent = yogaClass.description;

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "save-class-button";
  saveButton.dataset.classId = yogaClass.id;
  saveButton.textContent = isSaved ? "✓ Saved as my class" : "Save as my class";
  saveButton.setAttribute("aria-pressed", String(isSaved));

  card.append(title, details, description, saveButton);
  return card;
}

function renderClassCards(resultsContainer, statusElement, filterId) {
  const matches = getMatchingClasses(filterId);
  const savedId = loadFromStorage(STORAGE_KEYS.preferredClass);

  resultsContainer.innerHTML = "";
  matches.forEach(function (yogaClass) {
    resultsContainer.appendChild(createClassCard(yogaClass, savedId));
  });

  const label = filters.find(function (f) { return f.id === filterId; }).label;
  statusElement.textContent = filterId === "all"
    ? "Showing all " + matches.length + " classes."
    : "Showing " + matches.length + " of " + classes.length + " classes for “" + label + ".”";
}

function renderSavedClass(savedElement) {
  const savedClass = findClassById(loadFromStorage(STORAGE_KEYS.preferredClass));
  if (!savedClass) {
    savedElement.hidden = true;
    return;
  }
  savedElement.hidden = false;
  savedElement.innerHTML = "";

  const text = document.createElement("p");
  text.innerHTML = "<strong>Your saved class:</strong> ";
  text.append(savedClass.name + " (" + savedClass.schedule + ")");

  const link = document.createElement("a");
  link.href = "events.html#interest-form";
  link.textContent = "Request a spot in this class";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "clear-class-button";
  clearButton.textContent = "Clear";

  savedElement.append(text, link, clearButton);
}

function initClassFinder() {
  const finder = document.getElementById("class-finder");
  if (!finder) {
    return; // Not on the Services page.
  }

  const buttonContainer = finder.querySelector(".filter-buttons");
  const results = finder.querySelector(".finder-results");
  const status = finder.querySelector(".finder-status");
  const saved = finder.querySelector(".saved-class");
  let activeFilter = "all";

  function refresh() {
    renderFilterButtons(buttonContainer, activeFilter);
    renderClassCards(results, status, activeFilter);
    renderSavedClass(saved);
  }

  // Filter buttons
  buttonContainer.addEventListener("click", function (event) {
    const button = event.target.closest(".filter-button");
    if (!button) return;
    activeFilter = button.dataset.filter;
    refresh();
  });

  // Save buttons on each card
  results.addEventListener("click", function (event) {
    const button = event.target.closest(".save-class-button");
    if (!button) return;
    saveToStorage(STORAGE_KEYS.preferredClass, button.dataset.classId);
    refresh();
  });

  // Clear the saved class
  saved.addEventListener("click", function (event) {
    if (!event.target.closest(".clear-class-button")) return;
    localStorage.removeItem(STORAGE_KEYS.preferredClass);
    refresh();
  });

  refresh();
}

/* ==========================================================
   2. Request form validation
   ========================================================== */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\d{3}-\d{3}-\d{4}$/;

// Each rule checks one field and returns an error message, or "" if valid.
const validationRules = {
  "full-name": function (form) {
    const value = form.elements["full-name"].value.trim();
    if (value === "") return "Please enter your full name.";
    if (value.length < 2) return "Your name should be at least 2 characters long.";
    return "";
  },
  email: function (form) {
    const value = form.elements.email.value.trim();
    if (value === "") return "Please enter your email address so we can reach you.";
    if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email address, such as name@example.com.";
    return "";
  },
  phone: function (form) {
    const value = form.elements.phone.value.trim();
    if (value !== "" && !PHONE_PATTERN.test(value)) {
      return "Please use the format 555-555-5555, or leave this field blank.";
    }
    return "";
  },
  interest: function (form) {
    return form.elements.interest.value === "" ? "Please choose a class or workshop." : "";
  },
  experience: function (form) {
    return form.elements.experience.value === "" ? "Please select your experience level." : "";
  },
  "contact-method": function (form) {
    return form.elements["contact-method"].value === "" ? "Please choose how you would like us to contact you." : "";
  },
  message: function (form) {
    const length = form.elements.message.value.length;
    return length > 500 ? "Please keep your message under 500 characters (currently " + length + ")." : "";
  }
};

function showFieldError(form, fieldName, message) {
  const errorElement = document.getElementById(fieldName + "-error");
  const field = form.elements[fieldName];
  const inputs = field instanceof RadioNodeList ? Array.from(field) : [field];

  errorElement.textContent = message;
  inputs.forEach(function (input) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  });
}

function validateField(form, fieldName) {
  const message = validationRules[fieldName](form);
  showFieldError(form, fieldName, message);
  return message === "";
}

function validateForm(form) {
  let firstInvalid = null;
  Object.keys(validationRules).forEach(function (fieldName) {
    const isValid = validateField(form, fieldName);
    if (!isValid && firstInvalid === null) {
      firstInvalid = fieldName;
    }
  });
  return firstInvalid;
}

function focusField(form, fieldName) {
  const field = form.elements[fieldName];
  const target = field instanceof RadioNodeList ? field[0] : field;
  target.focus();
}

function prefillForm(form) {
  const savedClassId = loadFromStorage(STORAGE_KEYS.preferredClass);
  const status = document.getElementById("form-status");
  const interest = form.elements.interest;

  if (savedClassId && interest.querySelector('option[value="' + savedClassId + '"]')) {
    interest.value = savedClassId;
    status.textContent = "We pre-selected your saved class: " + findClassById(savedClassId).name + ".";
  }

  const contact = loadFromStorage(STORAGE_KEYS.contact);
  if (contact) {
    form.elements["full-name"].value = contact.name || "";
    form.elements.email.value = contact.email || "";
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const firstInvalid = validateForm(form);

  if (firstInvalid) {
    status.className = "form-status is-error";
    status.textContent = "Please fix the highlighted fields and try again.";
    focusField(form, firstInvalid);
    return;
  }

  // Remember contact details and the chosen class for next time.
  saveToStorage(STORAGE_KEYS.contact, {
    name: form.elements["full-name"].value.trim(),
    email: form.elements.email.value.trim()
  });
  if (findClassById(form.elements.interest.value)) {
    saveToStorage(STORAGE_KEYS.preferredClass, form.elements.interest.value);
  }

  const name = form.elements["full-name"].value.trim().split(" ")[0];
  form.reset();
  prefillForm(form);
  status.className = "form-status is-success";
  status.textContent = "Thank you, " + name + "! Your request was received. We will contact you within two business days.";
}

function initRequestForm() {
  const form = document.getElementById("interest-form");
  if (!form) {
    return; // Not on the Events page.
  }

  form.addEventListener("submit", handleSubmit);

  // Re-check a field as the user corrects it, so errors clear right away.
  Object.keys(validationRules).forEach(function (fieldName) {
    const field = form.elements[fieldName];
    const inputs = field instanceof RadioNodeList ? Array.from(field) : [field];
    inputs.forEach(function (input) {
      const eventName = input.type === "radio" || input.tagName === "SELECT" ? "change" : "input";
      input.addEventListener(eventName, function () {
        if (document.getElementById(fieldName + "-error").textContent !== "") {
          validateField(form, fieldName);
        }
      });
      input.addEventListener("blur", function () {
        if (input.value.trim() !== "" && input.type !== "radio") {
          validateField(form, fieldName);
        }
      });
    });
  });

  prefillForm(form);
}

/* ---------- Start ---------- */
initClassFinder();
initRequestForm();
