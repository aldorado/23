<?php

use Flynsarmy\CsvSeeder\CsvSeeder;

class Adm3TableSeeder extends CsvSeeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function __construct()
    {
        $this->table = 'adm3';
        $this->csv_delimiter = ';';
        $this->insert_chunk_size = 33;
        $this->filename = base_path().'/database/seeds/csv/adm3_table.csv';


    }
    public function run()
    {
        //
        DB::disableQueryLog();
        DB::table($this->table)->truncate();
        parent::run();
    }
}
