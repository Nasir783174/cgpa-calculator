const SCALES = { australian: { max:7, grades:[{label:"HD (7.00)",value:7,letter:"HD"},{label:"D  (6.00)",value:6,letter:"D"},{label:"C  (5.00)",value:5,letter:"C"},{label:"P  (4.00)",value:4,letter:"P"},{label:"F  (0.00)",value:0,letter:"F"}] } };
let currentScale="australian", semesterCount=0, sgpaRowCount=0;
document.addEventListener("DOMContentLoaded", initCalculator);
