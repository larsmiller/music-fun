document.addEventListener("DOMContentLoaded", () => {
  const musicPlayer = document.getElementById("music-player");
  const fileSelector = document.getElementById("midi-file-selector");
  const personSelector = document.getElementById("person-selector");
  const stopButton = document.getElementById("stop-button");
  const piano = document.getElementById("piano");

  // Insert 88 divs for MIDI notes (21 to 108)
  for (let i = 21; i <= 108; i++) {
    const key = document.createElement("div");
    key.id = `midi-${i}`;
    key.classList.add("key"); // Add the "key" class
    // key.textContent = i; // Optional: Display the MIDI note number
    piano.appendChild(key);
  }

  let currentSynths = [];
  let isPlaying = false;

  const stopPlayback = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear all scheduled events
    currentSynths.forEach((synth) => synth.dispose());
    currentSynths = [];
    isPlaying = false;
  };

  const triggerVisual = (note) => {
    const key = document.getElementById(`midi-${note.midi}`);
    if (key) {
      key.classList.add("active");
      setTimeout(() => {
        key.classList.remove("active");
      }, note.duration * 1000);
    }
  };

  const handleFileChange = async () => {
    const selectedFile = fileSelector.value;
    if (!selectedFile || selectedFile === "Choose something") {
      console.warn("No valid file selected.");
      return;
    }

    stopPlayback();

    await Tone.start();
    console.log("Audio started");

    // Fetch and load the JSON file
    fetch(selectedFile)
      .then((response) => response.json())
      .then((midi) => {
        const now = Tone.now();

        // Create synths for each track
        midi.tracks.forEach((track) => {
          if (!track.notes || !Array.isArray(track.notes)) {
            console.warn("Track has no notes or invalid notes format:", track);
            return;
          }

          const synth = new Tone.PolySynth(Tone.Synth).toDestination();
          currentSynths.push(synth);

          track.notes.forEach((note) => {
            synth.triggerAttackRelease(note.name, note.duration, now + note.time);

            // Schedule visual feedback
            Tone.Transport.scheduleOnce(() => {
              triggerVisual(note);
            }, note.time);
          });
        });

        Tone.Transport.start();
        isPlaying = true;
      })
      .catch((error) => console.error("Error loading MIDI JSON file:", error));
  };

  const handleStopClick = () => {
    if (isPlaying) {
      stopPlayback();
      console.log("Playback stopped.");
    } else {
      console.warn("No file is currently playing.");
    }
  };

  const handlePersonChange = () => {
    const selectedPerson = personSelector.value;
    console.log("Selected person:", selectedPerson);
    musicPlayer.classList = selectedPerson;
  };

  fileSelector.addEventListener("change", handleFileChange);
  personSelector.addEventListener("change", handlePersonChange);
  stopButton.addEventListener("click", handleStopClick);

  // Trigger handlePersonChange on load
  handlePersonChange();
});
