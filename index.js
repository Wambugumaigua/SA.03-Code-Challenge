document.addEventListener('DOMContentLoaded', () => {
    const baseURL = 'http://localhost:3000';

    const fetchFilms = async () => {
        try {
            const response = await fetch(${baseURL}/films);
            if (!response.ok) {
                throw new Error('Failed to fetch films');
            }
            const films = await response.json();

            const filmsList = document.getElementById('films');
            filmsList.innerHTML = '';

            films.forEach(film => {
                const li = createFilmListItem(film);
                filmsList.appendChild(li);
            });

            if (films.length > 0) {
                displayMovieDetails(films[0]);
            }
        } catch (error) {
            console.error('Error fetching films:', error);
        }
    };

    const createFilmListItem = (film) => {
        const li = document.createElement('li');
        li.textContent = film.title;
        li.classList.add('film', 'item');

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.onclick = async (event) => {
            event.stopPropagation();
            try {
                const deleteResponse = await fetch(${baseURL}/films/${film.id}, {
                    method: 'DELETE'
                });
                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete film');
                }
                filmsList.removeChild(li); 
            } catch (error) {
                console.error('Error deleting film:', error);
            }
        };

        li.appendChild(deleteButton);

        if (film.capacity - film.tickets_sold === 0) {
            li.classList.add('sold-out');
        }

        li.addEventListener('click', () => {
            displayMovieDetails(film);
        });

        return li;
    };

    const displayMovieDetails = (film) => {
        const movieDetails = document.getElementById('movieDetails');
        movieDetails.innerHTML = `
            <img src="${film.poster}" alt="${film.title}" style="max-width: 100%;">
            <p><strong>Title:</strong> ${film.title}</p>
            <p><strong>Runtime:</strong> ${film.runtime} mins</p>
            <p><strong>Showtime:</strong> ${film.showtime}</p>
            <p><strong>Available Tickets:</strong> ${film.capacity - film.tickets_sold}</p>
            <p>${film.description}</p>
        `;

        const buyTicketBtn = document.getElementById('buyTicketBtn');
        buyTicketBtn.disabled = film.capacity - film.tickets_sold === 0;

        if (film.capacity - film.tickets_sold === 0) {
            buyTicketBtn.textContent = 'Sold Out';
        } else {
            buyTicketBtn.textContent = 'Buy Ticket';
        }

        buyTicketBtn.onclick = async () => {
            if (film.capacity - film.tickets_sold > 0) {
                try {
                    const updatedTicketsSold = film.tickets_sold + 1;
                    const patchResponse = await fetch(${baseURL}/films/${film.id}, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ tickets_sold: updatedTicketsSold })
                    });

                    if (!patchResponse.ok) {
                        throw new Error('Failed to buy ticket');
                    }

                    await fetch(${baseURL}/tickets, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            film_id: film.id,
                            number_of_tickets: 1
                        })
                    });

                    displayMovieDetails({ ...film, tickets_sold: updatedTicketsSold });
                } catch (error) {
                    console.error('Error buying ticket:', error);
                }
            }
        };
    };

    fetchFilms();
});