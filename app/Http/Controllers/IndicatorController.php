<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Indicator;

class IndicatorController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        return response()->api(Indicator::with('type', 'categories', 'dataprovider')->get());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
        return response()->api(Indicator::where('id',$id)->with('type', 'categories', 'dataprovider', 'style', 'userdata')->first());
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $cats = array();
        foreach($request->input('categories') as $cat){
          $cats[] = $cat['id'];
        };
        $indicator = Indicator::find($id);
        $indicator->title = $request->input('title');
        $indicator->name = str_slug($request->input('title'));
        $indicator->description = str_slug($request->input('description'));
        $indicator->style_id = $request->input('style_id');
        $indicator->measure_type_id = $request->input('type')['id'];
        $indicator->dataprovider_id = $request->input('dataprovider')['id'];
        $indicator->is_official = $request->input('is_official');
        $indicator->is_public = $request->input('is_public');
        $indicator->categories()->sync($cats);

        return response()->api($indicator->save());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
    public function fetchData($id){
      $indicator = Indicator::find($id);
      $iso_field = $indicator->userdata->iso_type == 'iso-3166-1' ? 'adm0_a3': 'iso_a2';
      $data = \DB::table($indicator->table_name)
        ->where('year', \DB::raw('(select MAX('.$indicator->table_name.'.year) from '.$indicator->table_name.')'))
        ->leftJoin('23_countries', $indicator->table_name.".".$indicator->iso_name, '=', '23_countries.'.$iso_field)
        ->select($indicator->table_name.".".$indicator->column_name.' as score', $indicator->table_name.'.year','23_countries.'.$iso_field.' as iso','23_countries.admin as country')
        ->orderBy($indicator->table_name.".".$indicator->column_name, 'desc')->get();
    
      return response()->api($data);
    }
}
