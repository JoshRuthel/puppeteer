const {units} = require('../db/resources');

function getVolume(title) {
  if (title.includes('(Single Item)')) return ['single', 1];
  let fullTitle = title
    .replace(/\([^)]*\)/g, '')
    .trim()
    .toLowerCase(); //removes any bracket information (not needed usually)
  fullTitle = fullTitle
    .replace(' tub', '')
    .replace(' bowl', '')
    .replace('>', '')
    .replace('<', '')
    .trim();
  const unitSection = fullTitle.split(' ').pop();
  const titleWithoutUnit = fullTitle.split(' ').slice(0, -1).join(' ') + ' ';
  for (const unit of units) {
    if (unitSection.includes(unit)) {
      //Numberless units
      if (
        [
          'quarter',
          'single',
          'half',
          'bag',
          'tray',
          'bunch',
          'punnet',
        ].includes(unitSection)
      )
        return [unitSection, 1];
      //Volume units
      const newUnitSection = unitSection.replace(unit, '');
      const newTitle = titleWithoutUnit + newUnitSection;
      const volume = newTitle.trim().split(' ').pop();
      //odd kg case
      if (volume === 'per') return [unit, 1];
      volumeNumber = parseFloat(volume);
      // catch any edge cases - where there are no measurements and unit matches title name (not actually a unit match)
      if (isNaN(volumeNumber)) return ['single', 1];
      //Volume multipliers
      if (fullTitle.includes(' x ')) {
        const volumeSplit = fullTitle.split(' x ');
        const amount = Number(volumeSplit[0].split(' ').pop());
        volumeNumber *= amount;
      }
      return [unit, volumeNumber];
    }
  }
  return ['single', 1];
}

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

module.exports = { getVolume, delay };
