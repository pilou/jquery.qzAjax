<?php
	
switch(@$_GET['type']){
	case 'singleCallback':
	
		$qz =  [
			"callback"=>'setContent',
			"options"=>[
				'selector' => '.qzAjax:eq(0)',
				'html' => 'singleCallback setContent DONE',
			]
		];
	
	break;
	case 'multiCallback':
	
		$qz =  [
			"callbacks" => [
		    	"type"=>'parallel',
		    	"childCallbacks" => [
				    [
				        "callback"=>'setContent',
				        "options"=>[
					        'selector' => '.qzAjax:eq(1)',
					        'html' => 'multiCallback setContent 1 DONE',
				        ]
				    ],
				    [
				        "callback"=>'setContent',
				        "options"=>[
					        'selector' => '.qzAjax:eq(2)',
					        'html' => 'multiCallback setContent 2 DONE',
				        ]
				    ]
				]
			]
		];
	
	break;
	case 'data':
	
		$qz =  [
			"callback" =>'debug',
			"options" => [
				'log' => 'qzAjax callback | received DATA: '.$_REQUEST['qData']['foo']
			]
		];
	
	break;
	default: 
		
		$qz =  [
			"callback" =>'debug',
			"options" => [
				'log' => 'qzAjax callback '.time()
			]
		];
		
	break;
}

sleep(1);

print json_encode($qz);