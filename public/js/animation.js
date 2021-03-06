/*creating animated blocks for monitor*/
let block = 0;
let space = 32, currentPayload;
let blocksArray = [];

function getStats() {
    $.get('/blockchain', function(data) {
        let found = false;
        blocksArray.forEach(function(seekAndDestroy) {
            if (seekAndDestroy.height === data.height) {
                console.log(`block allready exists ${data.height}`);
                found = true;
                return;
            }
        });
        if (!found) {
            blocksArray.push(data);
            let appendToHistory = payloadHistory[payloadHistory.length - 1];
            appendToHistory.height = data.height;
            //console.log("data.height: " + data.height + "last \n" + JSON.stringify(payloadHistory[payloadHistory.length - 1].height));
            block = block + 1;
            $(".animationDiv").append("<div id='box" + block + "' class='block'>" + data.height + "</div>");
            $('.block:last').animate({ opacity: 1, left: (block * space) }, 1000, function() {
                $('.lastblock').removeClass('lastblock');
                if (appendToHistory.temperature > 24) { //appendToHistory.status === true && 
                    console.log(`getStats - status(return): ${appendToHistory.status} && ${appendToHistory.temperature}`);
                    $('.block:last').addClass('alertBlock');
                } else {
                    $('.block:last').addClass('lastblock');
                }
            });
            //console.log(JSON.stringify(data) + typeof (data));
            block++;
        }
    });
}

function sendBlocks(payload) {
    payload.user = currentPlayer.getTitle();
    payload.action = "transfer";
    doTransaction(payload);
    //console.log("sendBlocks: " + JSON.stringify(payload));
}

function getDeploymentBlock() {
    $.get('/genesis', function(deployed) {
        blocksArray.push(deployed);
        payloadHistory.push(deployed);
        block = block + 1;
        $(".animationDiv").append("<div id='firstBlockBox'class='block'>" + deployed.height + "</div>");
        $('.block:last').animate({ opacity: 1, left: (block * space) }, 1000, function() {
            $('.lastblock').removeClass('lastblock');
            $('.block:last').addClass('lastblock');
        });
        block++;
    });
}


$(document).on('mouseover', '.block', function(event) {
    let height = Number($(this).html());
    //console.log(`let height = Number($(this).html() ${height}`);
    payloadHistory.forEach(function(dataHistory) {
        //console.log("dataHistory " + JSON.stringify(dataHistory));
        if (dataHistory.height === height) {
            currentPayload = dataHistory;
        }
    });
    show_details(event, height, currentPayload);
});

$(document).on('mouseleave', '.block', function() {
    $('#details').fadeOut();
});

//Missing payload info
function show_details(event, id, message) {
    let currentBlock;
    var left, html, deploy = false;
    blocksArray.forEach(function(current) {
        if (current.height === id) {
            currentBlock = current;
            //console.log(currentBlock.height + " || " + id + " || " + message.height + " all " + JSON.stringify(currentBlock));
        }
        if (message.isDeploy) {
            message = { deployment: "first block!", created: message.lastTransaction }
            currentBlock.consensusMetadata = "genesis";
            deploy = true;
        } else if (message.isInit) {
            console.log(`isInit: ${message.isInit}`);
            message.action = "init";
        }
    });

    left = event.pageX - $('#details').parent().offset().left - 120;

    if (left < 0) left = 0;
    html = '<p class="blckLegend"> Ledger Block Height: ' + currentBlock.height + '</p>';
    html += '<hr class="line"/><p>Created: &nbsp;' + formatDate(currentBlock.created * 1000, '%M-%d-%Y %I:%m%p') + '</p>';
    html += ' UUID: &nbsp;&nbsp;&nbsp' + currentBlock.uuid.slice(0, 17);
    //html += '<p> Type: &nbsp;&nbsp;' + message.type + '</p>';
    html += '<p> Consensus Metadata:  &nbsp;&nbsp;&nbsp;&nbsp;' + currentBlock.consensusMetadata + '</p>';
    if (!deploy) {
        if (message.action === undefined) {
            message.action = "update";
        }
        html += ' Action: &nbsp;&nbsp;&nbsp;&nbsp' + message.action + '<br/>';
        html += ' Description: &nbsp;&nbsp;&nbsp;&nbsp' + message.description + '<br/>';
        html += ' Owner: &nbsp;&nbsp;&nbsp;&nbsp' + message.user + '<br/>';
        html += ' Temperature: &nbsp;&nbsp;&nbsp;&nbsp' + message.temperature + ' C.°<br/>';
    } else {
        html += ' Payload: <br/> ' + JSON.stringify(message) + '<br/>';
    }
    if (message.temperature > 24) {
        console.log("alert details");
        $('#details').addClass('alertDetails');

    }
    $('#details').html(html).css('left', left).fadeIn();

}

function formatDate(date, fmt) {
    date = new Date(date);
    function pad(value) {
        return (value.toString().length < 2) ? '0' + value : value;
    }
    return fmt.replace(/%([a-zA-Z])/g, function(_, fmtCode) {
        var tmp;
        switch (fmtCode) {
            case 'Y':								//Year
                return date.getUTCFullYear();
            case 'M':								//Month 0 padded
                return pad(date.getUTCMonth() + 1);
            case 'd':								//Date 0 padded
                return pad(date.getUTCDate());
            case 'H':								//24 Hour 0 padded
                return pad(date.getUTCHours());
            case 'I':								//12 Hour 0 padded
                tmp = date.getUTCHours();
                if (tmp === 0) tmp = 12;				//00:00 should be seen as 12:00am
                else if (tmp > 12) tmp -= 12;
                return pad(tmp);
            case 'p':								//am / pm
                tmp = date.getUTCHours();
                if (tmp >= 12) return 'pm';
                return 'am';
            case 'P':								//AM / PM
                tmp = date.getUTCHours();
                if (tmp >= 12) return 'PM';
                return 'AM';
            case 'm':								//Minutes 0 padded
                return pad(date.getUTCMinutes());
            case 's':								//Seconds 0 padded
                return pad(date.getUTCSeconds());
            case 'r':								//Milliseconds 0 padded
                return pad(date.getUTCMilliseconds(), 3);
            case 'q':								//UTC timestamp
                return date.getTime();
            default:
                throw new Error('Unsupported format code: ' + fmtCode);
        }
    });
}