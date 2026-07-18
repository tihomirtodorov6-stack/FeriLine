export function playMessageSound() {

  const AudioContext =
    window.AudioContext ||
    (window as any).webkitAudioContext;

  const context = new AudioContext();

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 800;

  gain.gain.value = 0.15;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    context.close();
  }, 150);

}