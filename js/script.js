const idFilm = "2";
const acc_username = "ddthanh";

let dateSelected = "";
let timeSelected = "";
let audiSelected = "";

let foody = {};

let listSeats = "";
let listFoodySelected = {};

let seatsNumber = 0;
let seatsSelected = {};
let ticketPrice = 0;
let foodMoney = 0;
let discount = 0;
let totalMoney = 0;

$(document).ready(function () {
  fetchDate();
  fetchFoody();
  fetchDataFilm();

  $("#username").html(acc_username);
  $("#app-food").hide();
  $("#add-food").click(function (e) {
    $("#app-food").toggle();
  });
  $("#close-foody").click(function () {
    $("#app-food").hide();
  })


  $("#date").change(onChangeDate);
  $("#auditorium").change(onChangeAudi);
  $("#time").change(onChangeTime);

  $("#buy-ticket").click(() => {
    postDataReservation();
    postDataReservationFoody();
  });

});

const fetchDataFilm = () => {
  $.ajax({
    url: 'http://localhost:8080/film/' + idFilm,
    type: "get",
    dataType: 'json',
    success: (data) => {
      $("#load-title").html(data.title);
      $("#load-imdb").html(data.imdb);
      $("#load-duration").html(`${parseInt(data.duration / 60)}h ${data.duration % 60}min`);
      $("#load-trailler").attr("href", data.trailler);
      $("#load-thumb").attr("src", data.thumb);
      $("img.img-banner").attr("src", data.banner);
    }
  });
}

function formatMoney(money) {
  var res = "";
  var moneyString = money.toString();

  for (var i = 0; i < moneyString.length; i++) {
    res = moneyString[moneyString.length - 1 - i] + res;

    if ((i + 1) % 3 == 0) {
      res = "," + res;
    }
  }

  if (res[0] == ',') {
    res = res.slice(1, res.length);
  }

  return res;
}

function onChangeDate() {
  if ($(this).find("option:selected").val() == 0) {
    return;
  }

  $("#time").html(`<option class="item-option" value="0">Select Time</option>`);
  $("#load-seats").html("");
  $("#list-food").html("");

  dateSelected = $(this).find("option:selected").val();
  fetchAuditorium(dateSelected);
}

function onChangeAudi() {
  if ($(this).find("option:selected").val() == 0) {
    return;
  }
  audiSelected = $(this).find("option:selected").val();

  fetchTime(dateSelected, audiSelected);
  $("#list-food").html("");
}

function onChangeTime() {
  if ($(this).find("option:selected").val() == 0) {
    return;
  }

  timeSelected = $(this).find("option:selected").val();

  fetchPriceDiscount(dateSelected, audiSelected, timeSelected);
  fetchAllSeats(dateSelected, audiSelected, timeSelected);
  showFoodData();
}

const fetchDate = () => {
  $.ajax({
    url: 'http://127.0.0.1:8080/film/' + idFilm + "/date",
    type: "get",
    dataType: 'json',
    success: (data) => {
      $("#date").html(listDateFunc(data));
    }
  });
}

const listDateFunc = (data) => {
  const date = data.map((valueDate) => {
    let dateTemp = new Date(valueDate);
    const day = dateTemp.getDate() / 10 < 1 ? "0" + dateTemp.getDate() : dateTemp.getDate();
    const month = (dateTemp.getMonth() + 1) / 10 < 1 ? "0" + (dateTemp.getMonth() + 1) : (dateTemp.getMonth() + 1);

    const obj = {
      id: valueDate,
      value: day + "/" + month + "/" + dateTemp.getFullYear()
    };

    return obj;
  });

  let listDate = [`<option className="item-option" value="0">Select Date</option>`];
  listDate.push(date.map((value, index) => {
    return `<option className="item-option" value=${value.id} key=${index}>${value.value}</option>`;
  }));

  return listDate;
}

const fetchAuditorium = (date) => {
  $.ajax({
    url: 'http://127.0.0.1:8080/film/' + idFilm + "/" + date + "/audi",
    type: "get",
    dataType: 'json',
    success: (data) => {
      $("#auditorium").html(listAudiFunc(data));
    }
  });
}

const listAudiFunc = (auditorium) => {
  let listAudi = [`<option class="item-option" value="0">Select Auditorium</option>`];
  listAudi.push(auditorium.map((valueAudi, index) => {
    return `<option className="item-option" value=${valueAudi.id} key=${index}>${valueAudi.name}</option>`;
  }));

  return listAudi;
}

const fetchTime = (date, audi) => {
  $.ajax({
    url: 'http://127.0.0.1:8080/film/' + idFilm + "/" + date + "/" + audi + "/time",
    type: "get",
    dataType: 'json',
    success: (data) => {
      $("#time").html(listTimeFunc(data));
    }
  });
}

const listTimeFunc = (time) => {
  let listTime = [`<option class="item-option" value="0">Select Time</option>`];
  listTime.push(time.map((time, index) => {
    return `<option className="item-option" value=${time} key=${index}>${time}</option>`;
  }));

  return listTime;
}

const fetchPriceDiscount = (dateSelected, audiSelected, timeSelected) => {
  $.ajax({
    url: 'http://127.0.0.1:8080/film/' + dateSelected + "/" + audiSelected + "/" + timeSelected + "/price",
    type: "get",
    dataType: 'json',
    success: (data) => {
      ticketPrice = data[0];
      discount = data[1];
      $("#ticket-price").html(`${formatMoney(data[0])} VND`);
      $("#discount").html(`${data[1]}%`);
    }
  });
}

const fetchAllSeats = (dateSelected, audiSelected, timeSelected) => {
  $.ajax({
    url: 'http://127.0.0.1:8080/film/' + dateSelected + "/" + audiSelected + "/" + timeSelected + "/all-seats",
    type: "get",
    dataType: 'json',
    success: (data) => {
      const addScript = `<script src="js/seat.js"></script>`;
      $("#load-seats").html(loadSeat(data));
      $("#add-script").html(addScript);
      fetchSeatsSold(dateSelected, audiSelected, timeSelected);
    }
  });
}

function loadSeat(data) {
  return data.map((value) => {
    return `<div class="col-1 mt-2 padding-seat"><div data-seat="${value.id}" class="seat text-uppercase my-text">${value.name}</div></div>`;
  });
}

const fetchSeatsSold = (dateSelected, audiSelected, timeSelected) => {
  $.ajax({
    url: 'http://127.0.0.1:8080/film/' + dateSelected + "/" + audiSelected + "/" + timeSelected + "/seats-sold",
    type: "get",
    dataType: 'json',
    success: (data) => {
      showSeatsSold(data);
    }
  });
}

const showSeatsSold = (seatsSold) => {
  for (let seat of seatsSold) {
    $(".seats .seat[data-seat=" + seat.id + "]").addClass("sold");
  }
}

const totalMoneyFunc = () => {
  totalMoney = Math.round(((ticketPrice * seatsNumber + foodMoney) * (1 - discount / 100)) / 1000) * 1000;

  $("#total-money").html(`${formatMoney(totalMoney)} VND`);
}

const fetchFoody = () => {
  $.ajax({
    url: 'http://127.0.0.1:8080/foody',
    type: "get",
    dataType: 'json',
    success: (data) => {
      foody = data;
    }
  });
}

const showFoodData = () => {
  const scriptFoody = `<script src="js/foody.js"></script>`;
  $("#list-food").html(listFoody(foody));
  $("#add-script-foody").html(scriptFoody);
}

const listFoody = (data) => {
  return data.map(value => {
    return `<div class="mt-3 col-6 col-sm-6 col-md-4 col-lg-3 col-xl-3">
    <div class="food-item">
      <div class="card">
        <div class="card-header img-food"><img class="card-img-top" src="${value.url}"
            alt="${value.alt}"></div>
        <div class="card-body">
          <h4 class="card-title">${value.title}</h4>
          <div class="row">
            <div class="col-12">
              <p class="card-text">Giá: ${formatMoney(value.price)} VND</p>
            </div>
            <div class="col-12"><input class="num-food form-control" type="number" name="num-food" data-foody="${value.id}"
                placeholder="Số lượng" max="50" min="0"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`
  });
}

function foodItemSelected() {
  const foodId = $(this).data("foody");
  const foodQuantity = Number($(this).val()) > 0 ? Number($(this).val()) : 0;

  listFoodySelected[foodId] = foodQuantity;
  calcFoodMoney();
}

const calcFoodMoney = () => {
  foodMoney = 0;

  for (const fooSelected in listFoodySelected) {
    for (const fooItem in foody) {
      if (foody[fooItem].id == fooSelected) {
        foodMoney += listFoodySelected[fooSelected] * foody[fooItem].price;
      }
    }
  }

  $("#food-price").html(`${formatMoney(foodMoney)} VND`);
  totalMoneyFunc();
}

const postDataReservation = () => {
  for (const seat_id in seatsSelected) {
    ajaxPostReservation(seat_id);
  }

}

const ajaxPostReservation = (seat_id) => {
  const data = {
    acc_username: acc_username,
    seat_id: seat_id,
    date: dateSelected,
    audi: audiSelected,
    time: timeSelected
  }

  $.ajax({
    url: `http://localhost:8080/film/reservation/`,
    type: "post",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: () => {
      location.reload();
    },
    error: () => {
    }
  });
}

const postDataReservationFoody = () => {
  for (const food in listFoodySelected) {
    ajaxPostReservationFoody(food, listFoodySelected[food]);
  }
}

const ajaxPostReservationFoody = (foo_id, quantity) => {
  const data = {
    acc_username: acc_username,
    foo_id: foo_id,
    quantity: quantity,
    date: dateSelected,
    audi: audiSelected,
    time: timeSelected
  }

  $.ajax({
    url: `http://localhost:8080/film/reservation-food/`,
    type: "post",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: () => {
      location.reload();
    },
    error: () => {
    }
  });
}