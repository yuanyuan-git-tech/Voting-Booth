let voterPackage = {}; // global container for holding ballot information
const viewType = {
    home: "home",
    ballot: "ballot",
    results: "results",
};

const modal = document.getElementById("myModal");
const btn = document.getElementById("addBtn");
const closeSpan = document.getElementsByClassName("close")[0];
const resultBtn = document.getElementById("showResults");

btn.onclick = function () {
    modal.style.display = "block";
};
resultBtn.onclick = function () {
    loadContent(viewType.results);
};
closeSpan.onclick = function () {
    modal.style.display = "none";
};

const endpoint = {
    candidates: "/api/candidates",
    candidatesWithBallots: "/api/candidates/ballots",
    voters: "/api/voters",
};

function initPage() {
    // Set up the page
    document.getElementById("heading").innerHTML = "Voting Booth";
    loadContent(viewType.home);
}

async function loadContent(view) {
    // reset the view
    const contentAreas = document.getElementsByClassName("displayArea");
    for (let area of contentAreas) {
        area.innerHTML = ""; // empty the containers for redrawing
    }
    switch (view) {
        case viewType.home: {
            fetchAndListCandidate(false);
            await fetchAndListVoters();
            break;
        }

        case viewType.ballot: {
            fetchAndDrawBallot();
            break;
        }

        case viewType.results: {
            fetchAndListCandidate(true);
            break;
        }
    }
}

// display a list of candidates
function fetchAndListCandidate(showVoters) {
    let target = "candidates";
    const idField = "name";
    if (showVoters) {
        target = "candidatesWithBallots";
    }
    const candidateNames = fetch(endpoint[target]);
    candidateNames
        .then((result) => result.json())
        .then((result) => {
            makeAList("candidatesList", result, idField, false, false);
        })
        .catch((error) => {
            console.error(error);
            statusMessage("Error accessing candidate service!");
        });
}

async function fetchAndListVoters() {
    try {
        const response = await fetch(endpoint.voters);
        const result = await response.json();

        const potentialBallots = result.filter((item) => item.ballot === null);
        const completedBallots = result.filter((item) => item.ballot !== null);

        makeAList("potentialBallots", potentialBallots, "name", showBallot, true);
        makeAList("completedBallots", completedBallots, "name", false, true);
    } catch (error) {
        console.error(error);
        statusMessage("Error accessing voter service!");
    }
}

// function fetchAndListVotersPromise() {
//     return new Promise((resolve, reject) => {
//         fetch(endpoint.voters)
//             .then(response =>
//                 response.json()
//                     .then(result => {
//                         const potentialBallots = result.filter((item) => item.ballot === null);
//                         const completedBallots = result.filter((item) => item.ballot !== null);
//
//                         makeAList('potentialBallots', potentialBallots, "name", showBallot, true);
//                         makeAList('completedBallots', completedBallots, "name", false, true);
//                         resolve(10)
//                     }))
//     })
// }

// show the ballot so the current user can vote
// STUB: alter the display to make it look like a ballot
function fetchAndDrawBallot() {
    const candidateNames = fetch(endpoint.candidates)
        .then((res) => res.json())
        .then((result) => {
            makeAList("candidatesList", result, "name", recordVoterAndVote, false);
        });
}

function makeAList(target, data, idField, ocfunction, deleteLink) {
    const element = document.getElementById(target);
    element.innerHTML = ""; // clear out content
    let list = document.createElement("ul");
    for (let i = 0; i < data.length; i++) {
        let li = document.createElement("li");
        let span = document.createElement("span");
        let keyValue = data[i][idField];
        if (ocfunction) {
            span.onclick = ocfunction;
        }
        span.innerHTML = data[i].name;
        span.id = keyValue;
        li.append(span);
        if (deleteLink) {
            const link = document.createElement("a");
            link.innerHTML = " [ x ]";
            link.onclick = function () {
                deleteVoter(keyValue);
            };
            li.append(link);
        }
        list.appendChild(li);
    }
    element.append(list);
}

async function recordVote(voter) {
    // when a user clicks on a candidate, record a vote
    // for that user and that candidate
    try {
        const dataToSend = {name: voter};
        const response = await fetch(endpoint.voters, {
            method: "POST",
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        });
        const result = await response.json();
        console.log(result);
        statusMessage("Successfully saving voters!");
    } catch (error) {
        console.error(error);
        statusMessage("Error saving voters!");
    }
}

async function recordNewVoter() {
    const newName = document.getElementById("userName").value;
    await recordVote(newName); // post to the API
    closeSpan.onclick();
    // I've added a voter, need to reload the voter list
    await fetchAndListVoters();
}

async function recordVoterAndVote() {
    // when a user clicks on a candidate, record a vote
    // for that user and that candidate
    voterPackage.candidate = this.id;
    try {
        const response = await fetch(endpoint.voters, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(voterPackage),
        });
        const results = await response.json();
        statusMessage(results);
        voterPackage = {};
        await loadContent(viewType.home);
    } catch (error) {
        console.error(error);
        statusMessage(error);
    }
}

// STUB: write a function to invoke the voter delete
// alert('delete voter');
function deleteVoter(name) {
    const voterPackage = {name: name};
    const response = fetch(endpoint.voters, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(voterPackage),
    });
    response
        .then((results) => results.json())
        .then((result) => {
            statusMessage(result);
            loadContent(viewType.home);
        });
}

async function showBallot() {
    voterPackage.voter = this.id;
    await loadContent(viewType.ballot);
}

function statusMessage(message) {
    document.getElementById("messages").innerHTML = message;
}
