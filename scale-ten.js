const SCALES = { ten: { max:10, grades:[{label:"O  (10.00)",value:10,letter:"O"},{label:"A+ (9.00)",value:9,letter:"A+"},{label:"A  (8.00)",value:8,letter:"A"},{label:"B+ (7.00)",value:7,letter:"B+"},{label:"B  (6.00)",value:6,letter:"B"},{label:"C  (5.00)",value:5,letter:"C"},{label:"P  (4.00)",value:4,letter:"P"},{label:"F  (0.00)",value:0,letter:"F"}] } };
let currentScale="ten", semesterCount=0, sgpaRowCount=0;
document.addEventListener("DOMContentLoaded", initCalculator);
