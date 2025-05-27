document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Fetch and render activities
  let activitiesData = {};

  async function fetchActivities() {
    const res = await fetch("/activities");
    activitiesData = await res.json();
    renderActivities(activitiesData);
  }

  function renderActivities(activities) {
    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';
    Object.entries(activities).forEach(([name, info]) => {
      const card = document.createElement('div');
      card.className = 'activity-card';

      // Activity name
      const title = document.createElement('h4');
      title.textContent = name;
      card.appendChild(title);

      // Description
      const desc = document.createElement('p');
      desc.textContent = info.description;
      card.appendChild(desc);

      // Schedule
      const sched = document.createElement('p');
      sched.innerHTML = `<strong>Schedule:</strong> ${info.schedule}`;
      card.appendChild(sched);

      // Availability
      const available = info.max_participants - info.participants.length;
      const avail = document.createElement('p');
      avail.innerHTML = `<strong>Available spots:</strong> <span class="availability-count">${available}</span>`;
      card.appendChild(avail);

      // --- Participants section ---
      const participantsSection = document.createElement('div');
      participantsSection.className = 'participants-section';
      const participantsTitle = document.createElement('strong');
      participantsTitle.textContent = 'Participants:';
      participantsSection.appendChild(participantsTitle);

      const participantsList = document.createElement('ul');
      participantsList.className = 'participants-list';
      if (Array.isArray(info.participants) && info.participants.length > 0) {
        info.participants.forEach(email => {
          const li = document.createElement('li');
          li.textContent = email;
          participantsList.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No participants yet';
        li.style.color = '#888';
        participantsList.appendChild(li);
      }
      participantsSection.appendChild(participantsList);
      card.appendChild(participantsSection);
      // --- End participants section ---

      activitiesList.appendChild(card);
    });
  }

  // Populate activity dropdown
  function populateActivityDropdown(activities) {
    activitySelect.innerHTML = "<option value=''>-- Select an activity --</option>";
    Object.keys(activities).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  // Handle signup form
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;
    messageDiv.className = "message hidden";
    messageDiv.textContent = "";

    if (!email || !activity) return;

    try {
      const res = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        const err = await res.json();
        messageDiv.className = "message error";
        messageDiv.textContent = err.detail || "Signup failed";
      } else {
        const data = await res.json();
        messageDiv.className = "message success";
        messageDiv.textContent = data.message;
        // Refresh activities and dropdown
        await fetchActivities();
        populateActivityDropdown(activitiesData);
        signupForm.reset();
      }
    } catch (error) {
      messageDiv.className = "message error";
      messageDiv.textContent = "Network error. Please try again.";
    }
  });

  // Initialize app
  fetchActivities().then(() => {
    populateActivityDropdown(activitiesData);
  });
});
