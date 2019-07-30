function convertDmsToDecimalDegrees(textValue) {
    var regExp = /(\S{1,})(°)(\S{1,})(′)(\S{1,})(″)?$/ig;

    var parsedValue = regExp.exec(textValue);

    var degrees = 0;
    var minutes = 0;
    var seconds = 0;

    if(parsedValue !== null){
        if(parsedValue.length > 0){
            degrees = Number.parseFloat(parsedValue[1]);
        }
        if(parsedValue.length > 2){
            minutes = Number.parseFloat(parsedValue[3]) / 60;
        }
        if(parsedValue.length > 4){
            seconds = Number.parseFloat(parsedValue[5]) / 3600;
        }
    }

    var decimalDegrees = degrees + minutes + seconds;
    var textValueInLowerCase = textValue.toLowerCase();
    if(textValueInLowerCase.includes('s') || textValueInLowerCase.includes('w')) {
        decimalDegrees *= -1;
    }

    return decimalDegrees.toPrecision(6);
}

module.exports = {
    convertDmsToDecimalDegrees,
};