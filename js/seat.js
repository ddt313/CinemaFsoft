$(document).ready(function () {
  $("div.seat").click(seatClickSelect);

});

function seatClickSelect() {
  if (this.classList.contains("sold")) {
    return;
  }

  this.classList.toggle("selected");
  let seat = this.dataset.seat;
  let text = $(this).text();

  if (seatsSelected[seat]) {
    delete seatsSelected[seat];
    seatsNumber--;
  } else {
    seatsSelected[seat] = {"id": seat, "text": text};
    seatsNumber++;
  }

  $("#number-of-seats").html(`${seatsNumber} Seats`);

  $("#list-seat-selected").empty();
  for (let seat in seatsSelected) {
    if (seat != "length") {
      let elementSeatSeleted = `<div class="seat-selected text-uppercase mb-1">${seatsSelected[seat]["text"]}</div>`;
      $("#list-seat-selected").append(elementSeatSeleted);
    }
  }
  
  totalMoneyFunc();
}