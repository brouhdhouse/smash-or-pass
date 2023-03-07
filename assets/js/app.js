// Ensure page loads first
$(document).ready(function(){
    // Current character on screen
    $base = 'chr-'
    $id = 0;

    // Voting types
    $types = ['smash','destroy','pass'];

    // Score count
    $score = [];
    $.each( $types, function( key, value ) {
        $score[$types[key]] = [];
    });

    // Key bindings (Currently unused)
    $keyBack = '38';
    $keyVoteSmash = '37';
    $keyVoteDestroy = '40';
    $keyVotePass = '39';

    // ---Functions---

    // Set or clear a cookie.
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    // Get a cookie.
    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }

    // Load all cookies.
    function loadCookies() {
        if (getCookie('id')) {
            $id = parseInt(getCookie('id'));
        }
        else {
            $id = 0;
        }

        $.each( $types, function( key, value ) {
            if (getCookie(value)) {
                $score[value]  = JSON.parse(getCookie(value));
            }
        });
    }

    // Reset all cookies.
    function resetCookies() {
        setCookie('id',0,-365);
        $.each( $types, function( key, value ) {
            setCookie(value,0,-365);
        });

        window.location.reload();
    }

    // Get character ID.
    function getId() {
        $chr = '#' + $base + $id;
        return $chr;
    }

    // Update the progress counter.
    function updateCounter() {
        $('.counter>span').replaceWith('<span>' + $id + ' out of</span>');
    }

    function checkBackButton() {
        if ($id <= 0) {
            $('#back').prop("disabled", true);
        }
        else {
            $('#back').prop("disabled", false);
        }
    }

    function addToScore($type) {
        $score[$type].push($id);
        
        setCookie($type, JSON.stringify($score[$type]), 365);
    }

    function removeFromScore() {
        $substraction = element => element == ($id - 1);
        $.each( $types, function( key, value ) {
            $previousId = $score[value].findIndex($substraction);
            if ($previousId > -1) {
                console.log($previousId);

                $score[value].splice($previousId, 1);
                console.log($score[value]);

                setCookie(value, JSON.stringify($score[value]), 365);
                console.log($score[value]);
            }
        });
    }

    function moveToNext($direction) {
        $('button').prop("disabled", true);

        $chr = getId();
        if ($direction == 'down') {
            $('#audio-explosion').trigger('play');
            $($chr + '>.character')
                .css('background-image','url(./assets/img/explosion-boom.gif)')
                .css('background-color','#ffffff00')
                .css('border-color','#ffffff00');
            $($chr).hide('fade',500);
        }
        else if ($direction) {
            $($chr).hide('slide',{direction: $direction},500);
        }
        else {
            $($chr).hide('fade',500);
        }
        
        $id = $id + 1;
        setCookie('id',$id,'365');

        updateCounter();

        $chr = getId();

        if ($($chr).length > 0) {
            if ($direction == 'down') {
                $($chr).delay(600).show('slide',{direction: 'left'},500);
            }
            else if ($direction) {
                $($chr).delay(600).show('slide',{direction: $direction},500);
            }

            window.setTimeout(function() {
                $('button').prop("disabled", false);
                checkBackButton();
            }, 1200);
        }
        else {
            window.setTimeout(function() {
                window.location.reload();
            }, 1200);
        };
    }

    function moveToPrevious() {
        $('button').prop("disabled", true);

        $chr = getId();
        $($chr).hide('fade',500);
        
        $id = $id - 1;
        setCookie('id',$id,'365');

        updateCounter();

        $chr = getId();

        $($chr).delay(600).show('fade',500);

        window.setTimeout(function() {
            $('button').prop("disabled", false);
            checkBackButton();
        }, 1200);
    }

    function checkIfForbidden() {
        $chr = getId();
        if ($($chr + ' .forbidden').length > 0) {
            $meme = '#forbidden-meme';
            $($meme).show();
            $($meme).delay().hide('fade',2000);
        }
    }

    function showResults() {
        $.each( $types, function( key, type ) {
            $group = 'group-' + type;
            $('.results').append(
                $("<div class='group-container'><h2 class='uppercase'>"
                    + type + " (" + $score[type].length + ")</h2><div class='group " + $group +
                "'></div></div>")
            );

            $.each( $score[type], function( key, value ) {
                $($('#chr-' + value)).appendTo($('.' + $group)).toggle();
            });

            $('.character-container').hide();
            $('.vote-button-container').hide();
            $('.action-button-container').fadeIn();
            
            $('.back-button').hide();
            $('#reset').prop("disabled", false);

            $('.results-container').fadeIn();
        });
    }

    // Used upon loading the page.
    function initalize() {
        // Load the cookies for the app.
        loadCookies();
        updateCounter();

        // Add current ID to $chr.
        $chr = getId();
        // Check if it exists.
        if ($($chr).length > 0) {
            // If ID exists.
            // Unhide hidden items.
            $('.vote-button-container').fadeIn(1000);
            $('.action-button-container').fadeIn(1000);
    
            $($chr).fadeIn(1000);
            
            // Enable button after animation.
            window.setTimeout(function() {
                $('button').prop("disabled", false);
                checkBackButton();
            }, 1000);
        }
        else {
            // If ID doesn't exist (higher than last character) go to results screen.
            showResults();
        };
    }

    // ---Events---

    initalize();

    // Buttons
    $.each( $types, function( key, value ) {
        $('#' + value).click(function(){
            addToScore(value);

            switch(value) {
                case 'smash':
                    checkIfForbidden();
                    moveToNext('left');
                    break;
                case 'destroy':
                    checkIfForbidden();
                    moveToNext('down');
                    break;
                case 'pass':
                    moveToNext('right');
                    break;
            }
        });
    });

    // Back button
    $('#back').click(function(){
        removeFromScore();
        moveToPrevious();
    });

    // Reset button
    $('#reset').click(function(){
        if(confirm("Are you sure you want to reset all your choices?")) {
            if(confirm("Are you REALLY sure? (That's a lot of characters!)")) {
                resetCookies();
            }
        }
    });
});