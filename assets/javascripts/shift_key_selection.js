$(function () {
  let countShift = 0, shiftArray = [], optionsSelected = [];
  $(document).on('select2:select', event => {
    countShift = 0;
    shiftArray = []
    optionsSelected = [];
  });
  $(document).on('select2:selecting select2:unselecting', event => {
    let target = $(event.target);
    if (!target.attr('multiple')) {
      return;
    }
    if (!event.params.args.originalEvent.shiftKey) {
      return;
    }

    event.preventDefault();

    shiftArray.push(event.params.args.data.element.index);
    countShift++;

    if (countShift < 2) {
      return;
    }

    let [first, second] = shiftArray;
    if (first === second) {
      // Cancel selection when clicking on the first element
      countShift = 0;
      shiftArray = []
      optionsSelected = [];

      return;
    }

    if (second < first) second = [first, first = second][0]; // swap variables
    while (second >= first) {
      optionsSelected.push(target.children('option').eq(second).val());
      second--;
    }

    let newItems = [];
    if (optionsSelected.filter(o => !target.val().includes(o)).length === 0) {
      // If all selected elements are already in the list, remove them
      newItems = target.val().filter(o => !optionsSelected.includes(o));
    } else {
      // Otherwise - add everything
      newItems = target.val().concat(optionsSelected);
    }
    target.val(newItems);

    target.trigger('change');
    target.select2('close');
    target.select2('open');
    countShift = 0;
    shiftArray = []
    optionsSelected = [];
  });

  // Syntax sugar for list item class
  function option(postFix = '') {
    let className = 'select2-results__option';
    if (postFix.length !== 0) {
      className += `--shift-${postFix}`;
    }

    return className;
  }

  // Click on a list item while holding down the Shift key
  $(document).on('click', '.' + option(), event => {
    let target = $(event.target);
    let firstElement = target.parent().children('.' + option('first'));
    target.parent().children().removeClass([
      option('first'),
      option('key-mark'),
    ]);
    if (event.shiftKey && !firstElement.is(target)) {
      target.addClass(option('first'));
    }
  });

  // Visualization of the selection of list elements that will be included in the selection
  $(document).on('mouseover mouseout', '.' + option(), event => {
    let target = $(event.target);
    let firstElement = target.parent().children('.' + option('first'));

    if (firstElement.length < 1) {
      return;
    }

    target.parent().children().removeClass([
      option('second'),
      option('key-mark'),
    ]);

    if (!event.shiftKey) {
      return;
    }

    target.addClass(option('second'));

    let [first, second] = [firstElement.index(), target.index()];
    if (second < first) second = [first, first = second][0]; // swap variables
    while (second >= first) {
      target.parent().children().eq(second).addClass(option('key-mark'));
      second--;
    }
  });
});