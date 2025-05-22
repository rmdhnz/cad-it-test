// fetch("https://dummyjson.com/user/login", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     username: "emilys",
//     password: "emilyspass",
//     expiresInMins: 30, // optional, defaults to 60
//   }),
// })
//   .then((res) => res.json())
//   .then(console.log);

// $.ajax({
//   url: "http://www.omdbapi.com/?apikey=2c1ddfdf&s=avengers",
//   success: (mv) => console.log(mv),
// });

// fetch("http://www.omdbapi.com/?apikey=2c1ddfdf&s=avengers")
//   .then((res) => res.json())
//   .then((mv) => console.log(mv.Search));

// const xhr = new XMLHttpRequest();
// xhr.onreadystatechange = function () {
//   if (xhr.status === 200) {
//     if (xhr.readyState === 4) {
//       console.log(JSON.parse(xhr.responseText));
//     }
//   } else {
//     console.log(xhr.responseText.Search);
//     return xhr.responseText.Search;
//   }
// };

// xhr.open("GET", "http://www.omdbapi.com/?apikey=2c1ddfdf&s=avengers");
// xhr.send();

// $.ajax({
//   url: "http://www.omdbapi.com/?apikey=2c1ddfdf&s=avengers",
//   success: (res) => {
//     console.log(res.Search);
//   },
//   err,
// });

$.ajax({
  url: "teams.json",
  method: "GET",
  success: (res) => {
    console.log(res);
  },
});
