
const { styler, decay, listen, pointer, value } = window.popmotion;

const slider = document.querySelector('.carousel');
const divStyler = styler(slider);
const sliderX = value(0, divStyler.set('x'));

listen(slider, 'mousedown touchstart')
  .start(() => {
    pointer({ x: sliderX.get() })
      .pipe(({ x }) => x)
      .start(sliderX);
  });

listen(document, 'mouseup touchend')
  .start(() => {
    decay({
      from: sliderX.get(),
      velocity: sliderX.getVelocity(),
      // power: 0.8,
      // timeConstant: 350,
      // restDelta: 0.5,
      // modifyTarget: v => v
    }).start(sliderX);
  });
