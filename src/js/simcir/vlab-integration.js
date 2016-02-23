$(function() {
    // registering customized devices
    //simcir.registerDevice('vlab',
    //    {
    //        "width":72,
    //        "height":72,
    //        "showToolbox":true,
    //        "toolbox":[
    //        ],
    //        "devices":[
    //            {"type":"JK-FF","id":"dev0","x":168,"y":48,"label":"JK-FF"},
    //            {"type":"In","id":"dev1","x":120,"y":32,"label":"T"},
    //            {"type":"In","id":"dev2","x":120,"y":80,"label":"CLK"},
    //            {"type":"Out","id":"dev3","x":248,"y":32,"label":"Q"},
    //            {"type":"Out","id":"dev4","x":248,"y":80,"label":"~Q"},
    //            {"type":"Toggle","id":"dev5","x":72,"y":32,"label":"Toggle"},
    //            {"type":"PushOn","id":"dev6","x":72,"y":80,"label":"PushOn"},
    //            {"type":"DC","id":"dev7","x":24,"y":56,"label":"DC"}
    //        ],
    //        "connectors":[
    //            {"from":"dev0.in0","to":"dev1.out0"},
    //            {"from":"dev0.in1","to":"dev2.out0"},
    //            {"from":"dev0.in2","to":"dev1.out0"},
    //            {"from":"dev1.in0","to":"dev5.out0"},
    //            {"from":"dev2.in0","to":"dev6.out0"},
    //            {"from":"dev3.in0","to":"dev0.out0"},
    //            {"from":"dev4.in0","to":"dev0.out1"},
    //            {"from":"dev5.in0","to":"dev7.out0"},
    //            {"from":"dev6.in0","to":"dev7.out0"}
    //        ]
    //    }
    //);


    // main integration code
    var $s = simcir;
    var $simcir = $('#experiment_space');
    var setCircuitData = function(data) {
        $simcir.children().remove();
        $s.setupSimcir($simcir, JSON.parse(data) );
    };
    var getCircuitData = function() {
        return $s.controller(
            $simcir.find('.simcir-workspace') ).text();
    };
    var componentsVerification = function(correct, current) {
        temp_ = {};
        for (device in correct) {
            temp_device = correct[device];
            if(temp_device.type in temp_) {
                temp_[temp_device.type]['count'] += 1;
            }
            else {
                temp_[temp_device.type] = {};
                temp_[temp_device.type]['count'] = 1;
            }
        }

        for (device in current) {
            temp_device = current[device];
            if(temp_device.type in temp_) {
                temp_[temp_device.type]['count'] -= 1;
                if(temp_[temp_device.type]['count'] < 0) {
                    alert('You have used extra "' + temp_device.type + '" type componenet.');
                    return false;
                }
            }
            else {
                alert('There isn\'t any need to use "' + temp_device.type + '" type component.');
                return false;
            }
        }

        for (device in temp_) {
            if(temp_[device]['count'] > 0) {
                alert('You need to add more "' + temp_device.type + '" type component.');
                return false;
            }
        }

        return true;
    };
    var connectionVerification = function(correct, current) {
        connection_count = {};
        id_to_component_mapping = {};
        for (x in correct.devices) {
            if(correct.devices[x].type in connection_count) {
                // ignore!
            }
            else {
                connection_count[correct.devices[x].type] = {}
            }
            curr_top_ = connection_count[correct.devices[x].type];
            id_to_component_mapping[correct.devices[x].id] = correct.devices[x].type;
            for (y in correct.devices) {
                if(correct.devices[y].type in curr_top_) {
                    // ignore!
                }
                else {
                    curr_top_[correct.devices[y].type] = {}
                    curr_top_[correct.devices[y].type]['count'] = 0;
                }
            }
        }

        for (connection in correct.connectors) {
            present = correct.connectors[connection];
            from_ = present.from.split('.')[0];
            to_ = present.to.split('.')[0];
            connection_count[id_to_component_mapping[from_]][id_to_component_mapping[to_]]['count'] += 1;
        }

        for (connection in current.connectors) {
            present = current.connectors[connection];
            from_ = present.from.split('.')[0];
            to_ = present.to.split('.')[0];
            connection_count[id_to_component_mapping[from_]][id_to_component_mapping[to_]]['count'] -= 1;
        }

        for (x in connection_count) {
            pre_ = connection_count[x];
            for (y in pre_) {
                c = pre_[y]['count'];
                if(c>0) {
                    alert('There are missing connection between ' + x + ' and ' + y + ' type componenet.');
                    return false;
                }
                else if(c<0) {
                    alert('There are unnecessary connection between ' + x + ' and ' + y + ' type componenet.')
                    return false;
                }
            }
        }

        return true;
    };
    var isCircuitComplete = function (correct) {
        var current = getCircuitData();
        current = JSON.parse(current);
        //if(current.connectors.length > correct.connectors.length) {
        //    alert('It seems like you have used extra wires than required.. :(');
        //    return;
        //}
        //else if(current.connectors.length < correct.connectors.length) {
        //    alert('It seems like you have not connected all components.. :(');
        //    return;
        //}
        if(componentsVerification(correct.devices, current.devices)) {
            if(connectionVerification(correct, current)) {
                return true;
            }
        }
        return false;
    };
    var initial_load = $simcir[0].getAttribute('initial_load');
    if(initial_load == null) {
        setCircuitData('{"width":935, "height":550}');
    }
    else {
        setCircuitData(initial_load);
    }
    $('#complete').click(function() {
        var correct = $simcir[0].getAttribute('correct');
        if(correct == null) {
            alert('Auto complete isn\'t present for this experiment');
            return;
        }
        else {
            setCircuitData(correct);
        }
    });
    $('#verify').click(function() {
        var correct = $simcir[0].getAttribute('correct');
        if(correct == null) {
            alert('Verification isn\'t present for this experiment');
            return;
        }
        else {
            if(isCircuitComplete(JSON.parse(correct))) {
                alert('Bravo! You have made correct circuit.');
            }
        }
    });
});