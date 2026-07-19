export function playMessageSound() {

  const audio = new Audio(
    "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
  );

  audio.volume = 1;

  audio.play().catch((error) => {
    console.log("Sound blocked:", error);
  });

}