<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Add10YearPercentChange extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::table('user_table_epi', function(Blueprint $table) {
            $table->double('10_year_change',5,2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
        Schema::table('user_table_epi', function(Blueprint $table) {
            $table->dropColumn('10_year_change');
        });
    }
}
