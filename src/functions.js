
var PI2 = Math.PI * 2;
var PIH = Math.PI / 2;
var degToRad = Math.PI / 180;

function randomBetween(min, max)
{
    return min + (Math.random() * (max - min));
}

function Clamp(num, min, max)
{
    return num <= min ? min : num >= max ? max : num;
}

function RemoveElement(arr, e)
{
    for (let i = 0; i < arr.length; i++)
    {
        if (arr[i] === e)
            arr.splice(i, 1);
    }
    return arr;
}

function RemoveElementAt(arr, i)
{
    arr.splice(i, 1);
    return arr;
}

function RotatePointAroundPoint(origCoord, pointCoord, angle)
{
    var x = pointCoord.x,
        y = pointCoord.y,
        cx = origCoord.x,
        cy = origCoord.y;
    var rad = angle;//(Math.PI / 180) * angle;
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);
    return {
        x: (cos * (x - cx)) + (sin * (y - cy)) + cx,
        y: (cos * (y - cy)) - (sin * (x - cx)) + cy
    };
}

// collisions
function PointInsideCircle(pointPosition, circle)
{
    let distX = pointPosition.x - circle.position.x;
    let distY = pointPosition.y - circle.position.y;

    let dist = Math.sqrt
    (
        distX * distX +
        distY * distY
    );

    return dist < circle.radious;
}

function CheckCollisionPolygon(point, polygon)
{
    // Check if the point is inside the polygon
    var count = polygon.length;
    for (var i = 0; i < polygon.length; i++)
    {
        //var d = DistancePointToSegment(polygon[i], polygon[(i + 1) % polygon.length], point);
        var d = PointToSegmentSign(polygon[i], polygon[(i + 1) % polygon.length], point);
        if (d < 0)
            count--;
    }
    return (count == 0);
}

function DistancePointToSegment(A, B, p)
{
    // A & B are points of the segment
    return (((B.x - A.x)*(A.y - p.y) - (A.x - p.x)*(B.y - A.y)) /
        (Math.sqrt((B.x - A.x)*(B.x - A.x) + (B.y - A.y)*(B.y - A.y))));
}

function PointToSegmentSign(A, B, p)
{
    return ((B.x - A.x)*(A.y - p.y) - (A.x - p.x)*(B.y - A.y));
}

function PowDistance(p1, p2)
{
    let difX = p1.x - p2.x;
    difX *= difX;
    let difY = p1.y - p2.y;
    difY *= difY;

    return Math.abs(difX + difY);
}

function Distance(p1, p2)
{
    let difX = p1.x - p2.x;
    difX *= difX;
    let difY = p1.y - p2.y;
    difY *= difY;

    return Math.sqrt(difX + difY);
}