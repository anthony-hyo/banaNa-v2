/*
 * (c) 2013 InfinityArts
 * All codes are for use only in HiddenProject
 */

import {java, long, S} from "jree";


/**
 *
 * @author Mystical
 */
export class RequestException extends java.lang.Exception {

    private static readonly serialVersionUID: long = 1n;

    private type: java.lang.String | null = "warning";

    public constructor();

    public constructor(msg: java.lang.String | null);

    public constructor(msg: java.lang.String | null, type: java.lang.String | null);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {

                super();


                break;
            }

            case 1: {
                const [msg] = args as [java.lang.String];


                super(msg);


                break;
            }

            case 2: {
                const [msg, type] = args as [java.lang.String, java.lang.String];


                super(msg);

                this.type = type;


                break;
            }

            default: {
                throw new java.lang.IllegalArgumentException(S`Invalid number of arguments`);
            }
        }
    }


    public getType(): java.lang.String | null {
        return this.type;
    }
}
