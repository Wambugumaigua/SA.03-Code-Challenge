document.addEventListener('DOMContentLoaded', function () {
    let baseURL = "http://localhost:3000/films/";
    let ulFilms = document.getElementById("films");
    let idBuyticket = document.getElementById("buy-ticket");
    let movieImg = document.getElementById("poster");
    let idTitle = document.getElementById("title");
    let idRuntime = document.getElementById("runtime");
    let idFilmInfo = document.getElementById("film-info");
    let idShowtime = document.getElementById("showtime");
    let idTicketnum = document.getElementById("ticket-num");

    function renderMovie() {
        fetch(baseURL)
            .then(res => res.json())
            .then(data => {
                ulFilms.innerHTML = "";
                data.forEach(logMovie);
            })
            .catch(error => console.error('Error fetching movies:', error));
    }
    
    renderMovie();

    function logMovie(movie) {
        let remainingTickets = movie.capacity - movie.tickets_sold;
        let liFilm = document.createElement("li");
        let movieSpan = document.createElement("span");
        movieSpan.innerText = movie.title;
        liFilm.appendChild(movieSpan);
    
        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        liFilm.appendChild(deleteButton);
    
        deleteButton.addEventListener('click', () => deleteMovie(movie));
    
        movieSpan.addEventListener('click', () => updateDom(movie));
    
        ulFilms.appendChild(liFilm);
    
        if (movie.id === "1") {
            updateDom(movie);
        }
    }

    function updateDom(movie) {
        let remainingTickets = movie.capacity - movie.tickets_sold;
        idBuyticket.dataset.movieId = movie.id;

        let ticketAvailability = remainingTickets > 0 ? "Buy Ticket" : "Sold out";

        movieImg.src = movie.poster;
        movieImg.alt = movie.title;
        idTitle.innerText = movie.title;
        idRuntime.innerText = movie.runtime + " minutes";
        idFilmInfo.innerText = movie.description;
        idShowtime.innerText = movie.showtime;
        idTicketnum.innerText = remainingTickets;

        idBuyticket.onclick = () => {
            if (remainingTickets > 0) {
                buyTicket(movie);
            } else {
                console.log("The tickets are sold out!!");
            }
        };

        let button = document.querySelector('[data-movie-id="' + movie.id + '"]');
        button.innerText = ticketAvailability;
    }

    function buyTicket(movie) {
        movie.tickets_sold++;
        let requestHeaders = {
            "Content-Type": "application/json"
        };
        let requestBody = {
            "tickets_sold": movie.tickets_sold
        };
        fetch(baseURL + movie.id, {
            method: "PATCH",
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to update tickets_sold');
            }
            return res.json();
        })
        .then(data => {
            updateDom(data);
            let numberOfTickets = data.capacity - data.tickets_sold;

            if (numberOfTickets <= 0) {
                renderMovie();
            }

            let requestBodyTickets = {
                "film_id": data.id,
                "number_of_tickets": numberOfTickets
            };

            fetch("http://localhost:3000/tickets", {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(requestBodyTickets)
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to create ticket');
                }
                return res.json();
            })
            .then(data => console.log(data))
            .catch(error => console.error('Error buying ticket:', error));
        })
        .catch(error => console.error('Error buying ticket:', error));
    }

    function deleteMovie(movie) {
        let requestHeaders = {
            "Content-Type": "application/json"
        };
        let requestBody = {
            "id": movie.id
        };
        fetch(baseURL + movie.id, {
            method: "DELETE",
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to delete movie');
            }
            return res.json();
        })
        .then(renderMovie)
        .catch(error => console.error('Error deleting movie:', error));
    }
});