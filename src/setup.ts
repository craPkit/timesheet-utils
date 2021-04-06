import csvtojson from 'csvtojson';

export const csv = csvtojson({
    delimiter: ';',
    ignoreEmpty: true,
    flatKeys: true,
    escape: '\\',
});
